import { db } from "@@/drizzle";
import { users } from "@@/drizzle/schema";
import { eq } from "drizzle-orm";
import { omit } from "lodash-es";
import { useCheckLogin, userCache } from "@@/server/utils/auth";

export default defineEventHandler(async (event) => {
  const loginUser = await useCheckLogin(event);
  const body = await readBody(event);

  // 确定要更新的用户 ID
  const userId = body.userId || loginUser.userId;

  if (!userId) throw createError({ status: 400, message: "用户 ID 不能为空" });

  // 权限检查：只有超级管理员可以更新其他用户信息
  if (userId !== loginUser.userId && loginUser.role !== "SUPER_ADMIN")
    throw createError({ status: 403, message: "权限不足" });

  // 权限检查：非超级管理员不能修改角色
  if (loginUser.role !== "SUPER_ADMIN" && body.role)
    throw createError({ status: 403, message: "权限不足" });

  // 如果有密码，则加密
  if (body.password) body.password = await Bun.password.hash(body.password);

  // 更新用户信息
  const [user] = await db
    .update(users)
    .set(omit(body, ["userId"]))
    .where(eq(users.userId, userId))
    .returning();

  if (!user) throw createError({ status: 404, message: "用户不存在" });

  // 更新缓存
  userCache.set(userId, omit(user, ["password"]));

  // 返回用户信息（不含密码）
  return omit(user, ["password"]);
});
