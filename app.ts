import "dotenv/config";
import { Server } from "socket.io";
import { handleAuth } from "./utils/auth";
import { handleTranslate } from "./router/translate";
import { handleVariables } from "./router/variables";
import {
  createApp,
  createRouter,
  defineEventHandler,
  handleCors,
  toNodeListener,
} from "h3";
import { createServer } from "node:http";
import { handleHtmlToMarkdown, handleMarkdownToHtml } from "./router/markdown";

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
app.use(router);

router
  .use("/api/auth/**", handleAuth)
  .use("/api/markdown2html", handleMarkdownToHtml)
  .use("/api/html2markdown", handleHtmlToMarkdown);

const server = createServer(toNodeListener(app));
server.listen(3000);

const io = new Server({
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  handleTranslate(io, socket);
  handleVariables(io, socket);
});

io.listen(4000);
