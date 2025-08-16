import { db, UserInsertType, UserUpdateType } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { uuidV7 } from "@/utils/uuid";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { omit } from "lodash-es";
import {
  clearOutdatedToken,
  selectUserByUserId,
  useCheckLogin,
  userCache,
  useSetTokenCookie,
} from "./token";

export const UserPlugin = new Elysia({
  name: "/user",
})
  .post(
    "/api/user/register",
    async (ctx) => {
      const { body } = ctx;
      body.password = await Bun.password.hash(body.password);
      const [user] = await db
        .insert(users)
        .values({
          ...body,
          userId: uuidV7(),
        })
        .returning();
      if (!user) throw ctx.status(400);
      return useSetTokenCookie({
        ctx,
        user,
      });
    },
    {
      body: t.Pick(UserInsertType, ["userName", "password", "email"]),
    },
  )
  .post(
    "/api/user/login",
    async (ctx) => {
      const { body } = ctx;
      const [user] = await db.select().from(users).where(eq(users.email, body.email));
      if (!user) throw ctx.status(401);
      const isPasswordValid = await Bun.password.verify(body.password, user.password);
      if (!isPasswordValid) throw ctx.status(401);
      clearOutdatedToken();
      return useSetTokenCookie({
        ctx,
        user,
      });
    },
    {
      body: t.Pick(UserInsertType, ["email", "password"]),
    },
  )
  .put(
    "/api/user",
    async (ctx) => {
      const loginUser = await useCheckLogin(ctx);
      const { body } = ctx;
      const userId = body.userId || loginUser.userId;
      if (!userId) throw ctx.status(400);
      if (userId !== loginUser.userId && loginUser.role !== "SUPER_ADMIN") throw ctx.status(403);
      if (loginUser.role !== "SUPER_ADMIN" && body.role) throw ctx.status(403);
      if (body.password) body.password = await Bun.password.hash(body.password);
      const [user] = await db
        .update(users)
        .set(omit(body, ["userId"]))
        .where(eq(users.userId, userId))
        .returning();
      if (!user) throw ctx.status(404);
      userCache.set(userId, omit(user, ["password"]));
      return omit(user, ["password"]);
    },
    {
      body: t.Omit(UserUpdateType, ["createdAt", "updatedAt"]),
    },
  )
  .get(
    "/api/user",
    async (ctx) => {
      const loginUser = await useCheckLogin(ctx);
      const { query } = ctx;
      const userId = query.userId || loginUser.userId;
      if (!userId) throw ctx.status(400);
      if (userId !== loginUser.userId && loginUser.role !== "SUPER_ADMIN") throw ctx.status(403);
      const user = await selectUserByUserId(userId);
      if (!user) throw ctx.status(404);
      return user;
    },
    {
      query: t.Object({
        userId: t.Optional(t.String()),
      }),
    },
  )
  .delete(
    "/api/user",
    async (ctx) => {
      const loginUser = await useCheckLogin(ctx);
      const { query } = ctx;
      const userId = query.userId || loginUser.userId;
      if (!userId) throw ctx.status(400);
      if (userId !== loginUser.userId && loginUser.role !== "SUPER_ADMIN") throw ctx.status(403);
      await db.delete(users).where(eq(users.userId, userId));
      userCache.delete(userId);
      return { message: "删除成功" };
    },
    {
      query: t.Object({
        userId: t.Optional(t.String()),
      }),
    },
  );
