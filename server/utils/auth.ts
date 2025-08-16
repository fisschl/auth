import { db } from "@@/drizzle";
import { tokens, users } from "@@/drizzle/schema";
import type { InferSelectModel } from "drizzle-orm";
import { subDays } from "date-fns";
import { eq, inArray, lt } from "drizzle-orm";
import { omit, throttle } from "lodash-es";
import { LRUCache } from "lru-cache";
import type { H3Event } from "h3";

export type UserModel = Omit<InferSelectModel<typeof users>, "password">;

/**
 * userId -> User
 */
export const userCache = new LRUCache<string, UserModel>({
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

export const selectUserByUserId = async (userId: string): Promise<UserModel | undefined> => {
  const cachedUser = userCache.get(userId);
  if (cachedUser) return cachedUser;
  const [user] = await db.select().from(users).where(eq(users.userId, userId));
  if (!user) return;
  const result = omit(user, ["password"]);
  userCache.set(userId, result);
  return result;
};

export const selectUserByToken = async (token: string): Promise<UserModel | undefined> => {
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

export const useLoginToken = (event: H3Event) => {
  const query = getQuery(event);
  const headers = getHeaders(event);
  const cookie = parseCookies(event);

  // 从查询参数中获取 token
  if (query.token) return String(query.token);

  // 从 Authorization 头中获取 token
  const authorization = headers.authorization;
  if (authorization) {
    const content = authorization.replace(/Bearer\s+/, "");
    if (content) return content;
  }

  // 从 cookie 中获取 token
  if (cookie.token) return cookie.token;
};

export const useLoginUser = async (event: H3Event): Promise<UserModel | undefined> => {
  const token = useLoginToken(event);
  if (!token) return;
  return selectUserByToken(token);
};

export const useCheckLogin = async (event: H3Event): Promise<UserModel> => {
  const user = await useLoginUser(event);
  if (!user)
    throw createError({
      status: 401,
      message: "未授权",
    });
  return user;
};

export const useSetTokenCookie = async (event: H3Event, options: { userId: string }) => {
  const [token] = await db
    .insert(tokens)
    .values({
      userId: options.userId,
    })
    .returning();
  if (!token)
    throw createError({
      status: 400,
      message: "创建令牌失败",
    });

  const expires = subDays(new Date(), -60); // 设置为 60 天后过期
  setCookie(event, "token", token.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires,
  });

  const user = await selectUserByUserId(options.userId);
  if (!user) throw createError({ status: 404, message: "用户不存在" });

  return {
    ...user,
    token: token.token,
  };
};
