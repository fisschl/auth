import { db } from "@@/drizzle";
import { users } from "@@/drizzle/schema";
import { eq } from "drizzle-orm";
import { useCheckLogin, userCache } from "@@/server/utils/auth";

export default defineEventHandler(async (event) => {
  const loginUser = await useCheckLogin(event);
  const query = getQuery(event);

  // 确定要删除的用户 ID
  const userId = query.userId ? String(query.userId) : loginUser.userId;

  if (!userId) throw createError({ status: 400, message: "用户 ID 不能为空" });

  // 权限检查：只有超级管理员可以删除其他用户
  if (userId !== loginUser.userId && loginUser.role !== "SUPER_ADMIN")
    throw createError({ status: 403, message: "权限不足" });

  // 删除用户
  await db.delete(users).where(eq(users.userId, userId));

  // 从缓存中删除用户信息
  userCache.delete(userId);

  // 返回成功信息
  return { message: "删除成功" };
});
