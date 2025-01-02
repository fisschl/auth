import "dotenv/config";
import { handleAuth } from "./utils/auth";
import {
  createApp,
  createRouter,
  defineEventHandler,
  handleCors,
  toNodeListener,
} from "h3";
import { createServer } from "node:http";

export const app = createApp();

const corsHandler = defineEventHandler(async (event) => {
  const didHandleCors = handleCors(event, {
    origin: "*",
    methods: "*",
    preflight: { statusCode: 204 },
  });
  if (didHandleCors) return true;
});
app.use(corsHandler);

const router = createRouter();

router.use("/api/auth/**", handleAuth);

app.use(router);

const server = createServer(toNodeListener(app));
server.listen(3000);
