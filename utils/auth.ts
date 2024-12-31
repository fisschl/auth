import { betterAuth } from "better-auth";
import pg from "pg";
import { username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { defineEventHandler, toWebRequest } from "h3";

const { AUTH_DATABASE_URL } = process.env;
const { Pool } = pg;

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: new Pool({
    connectionString: AUTH_DATABASE_URL,
  }),
  plugins: [username(), passkey()],
});

export const handleAuth = defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  return auth.handler(request);
});
