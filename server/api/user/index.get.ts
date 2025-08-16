import { selectUserByUserId, useCheckLogin } from "@@/server/utils/auth";

export default defineEventHandler(async (event) => {
  const loginUser = await useCheckLogin(event);
  const query = getQuery(event);

  // 确定要查询的用户 ID
  const userId = query.userId ? String(query.userId) : loginUser.userId;

  if (!userId) throw createError({ status: 400, message: "用户 ID 不能为空" });

  // 权限检查：只有超级管理员可以查询其他用户信息
  if (userId !== loginUser.userId && loginUser.role !== "SUPER_ADMIN")
    throw createError({ status: 403, message: "权限不足" });

  // 查询用户信息
  const user = await selectUserByUserId(userId);

  if (!user) throw createError({ status: 404, message: "用户不存在" });

  // 返回用户信息
  return user;
});
