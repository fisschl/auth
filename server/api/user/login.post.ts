import { db } from "@@/drizzle";
import { users } from "@@/drizzle/schema";
import { eq } from "drizzle-orm";
import { clearOutdatedToken, useSetTokenCookie } from "@@/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // 验证请求体
  if (!body.email || !body.password) throw createError({ status: 400, message: "缺少必填字段" });

  // 根据邮箱查询用户
  const [user] = await db.select().from(users).where(eq(users.email, body.email));

  if (!user) throw createError({ status: 401, message: "未授权" });

  // 验证密码
  const isPasswordValid = await Bun.password.verify(body.password, user.password);

  if (!isPasswordValid) throw createError({ status: 401, message: "未授权" });

  // 清理过期 token
  clearOutdatedToken();

  // 设置 token cookie 并返回用户信息
  return useSetTokenCookie(event, {
    userId: user.userId,
  });
});
