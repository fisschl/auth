import { toNodeHandler } from "better-auth/node";
import { auth } from "../utils/auth";
import { defineEventHandler } from "h3";

const betterAuthHandler = toNodeHandler(auth);

export default defineEventHandler(async (event) => {
  const { req, res } = event.node;
  await betterAuthHandler(req, res);
});
