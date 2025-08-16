import { SQL } from "bun";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { drizzle } from "drizzle-orm/bun-sql";
import { users } from "./schema";

const { DATABASE_URL } = Bun.env;
export const sql = new SQL(DATABASE_URL!);
export const db = drizzle(sql);

export const UserSelectZod = createSelectSchema(users);
export const UserInsertZod = createInsertSchema(users);
export const UserUpdateZod = createUpdateSchema(users);
