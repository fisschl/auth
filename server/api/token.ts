import { db, UserSelectType } from "@/drizzle";
import { tokens, users } from "@/drizzle/schema";
import { subDays } from "date-fns";
import { eq, inArray, lt } from "drizzle-orm";
import { type Context, type Static } from "elysia";
import { omit, throttle } from "lodash-es";
import { LRUCache } from "lru-cache";

export type CacheUser = Omit<Static<typeof UserSelectType>, "password">;

/**
 * userId -> User
 */
export const userCache = new LRUCache<string, CacheUser>({
  max: 1024,
  ttl: 1000 * 60 * 60 * 24,
});

/**
 * token -> userId
 */
export const tokenCache = new LRUCache<string, string>({
  max: 6 * 1024,
  ttl: 1000 * 60 * 60 * 24,
});

export const selectUserByUserId = async (userId: string) => {
  const cachedUser = userCache.get(userId);
  if (cachedUser) return cachedUser;
  const [user] = await db.select().from(users).where(eq(users.userId, userId));
  if (!user) return;
  const result = omit(user, ["password"]);
  userCache.set(userId, result);
  return result;
};

export const selectUserByToken = async (token: string) => {
  const userId = tokenCache.get(token);
  if (userId) return selectUserByUserId(userId);
  const [tokenInfo] = await db.select().from(tokens).where(eq(tokens.token, token));
  if (!tokenInfo) return;
  const user = await selectUserByUserId(tokenInfo.userId);
  if (!user) return;
  tokenCache.set(token, user.userId);
  return user;
};

export const later = (fn: () => unknown) =>
  throttle(fn, 1000 * 60, { leading: false, trailing: true });

export const clearOutdatedToken = later(async () => {
  const date = subDays(new Date(), 60);
  const oldTokens = await db
    .select({ token: tokens.token })
    .from(tokens)
    .where(lt(tokens.createdAt, date.toISOString()))
    .limit(1024);
  if (!oldTokens.length) return;
  const tokenValues = oldTokens.map((t) => t.token);
  await db.delete(tokens).where(inArray(tokens.token, tokenValues));
  for (const token of oldTokens) tokenCache.delete(token.token);
});

export const useLoginToken = (ctx: Context) => {
  const { cookie, query, headers } = ctx;
  {
    const { token } = query;
    if (token) return token;
  }
  {
    const { authorization } = headers;
    const content = authorization?.replace(/Bearer\s+/, "");
    if (content) return content;
  }
  {
    const { token } = cookie;
    if (token?.value) return token.value;
  }
};

export const useLoginUser = (ctx: Context) => {
  const token = useLoginToken(ctx);
  if (!token) return;
  return selectUserByToken(token);
};

export const useCheckLogin = async (ctx: Context) => {
  const user = await useLoginUser(ctx);
  if (!user) throw ctx.status(401);
  return user;
};

export const useSetTokenCookie = async (params: {
  ctx: Context;
  user: Static<typeof UserSelectType> | CacheUser;
}) => {
  const { ctx, user } = params;
  const [token] = await db
    .insert(tokens)
    .values({
      userId: user.userId,
    })
    .returning();
  if (!token) throw ctx.status(400);
  const { cookie } = ctx;
  const expires = subDays(new Date(), 60);
  cookie.token!.set({
    value: token.token,
    expires,
  });
  return {
    ...omit(user, ["password"]),
    token: token.token,
  };
};
