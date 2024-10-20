import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { passkey } from "better-auth/plugins";
import { username } from "better-auth/plugins";

const { DATABASE_URL } = process.env;

export const auth = betterAuth({
  database: new Pool({
    connectionString: DATABASE_URL,
  }),
  plugins: [username(), passkey()],
});
