import "dotenv/config";
import {
  createApp,
  createRouter,
  defineEventHandler,
  handleCors,
  toNodeListener,
} from "h3";
import { createServer } from "node:http";
import hello from "./router/hello";
import auth from "./router/auth";

export const app = createApp();

const router = createRouter();
app.use(router);

const corsHandler = defineEventHandler(async (event) => {
  const didHandleCors = handleCors(event, {
    origin: "*",
    preflight: {
      statusCode: 204,
    },
    methods: "*",
  });
  if (didHandleCors) return true;
});

app.use(corsHandler);

router.use("/api/hello", hello);
router.use("/api/auth/**", auth);

const server = createServer(toNodeListener(app));
server.listen(4030);
