import { db } from "@@/drizzle";
import { users } from "@@/drizzle/schema";
import { v7 } from "uuid";
import { useSetTokenCookie } from "@@/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // 验证请求体
  if (!body.userName || !body.password || !body.email)
    throw createError({ status: 400, message: "缺少必填字段" });

  // 密码加密
  body.password = await Bun.password.hash(body.password);

  // 创建用户
  const [user] = await db
    .insert(users)
    .values({
      ...body,
      userId: v7(),
    })
    .returning();

  if (!user) throw createError({ status: 400, message: "创建用户失败" });

  // 设置 token cookie 并返回用户信息
  return useSetTokenCookie(event, {
    userId: user.userId,
  });
});
