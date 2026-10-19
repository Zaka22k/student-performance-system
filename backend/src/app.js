import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma.js";
import errorsPlugin from "./plugins/errors.js";
import staticPlugin from "./plugins/static.js";
import routes from "./routes/index.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(errorsPlugin);
  await app.register(prismaPlugin);
  await app.register(routes, { prefix: "/api" });
  await app.register(staticPlugin);

  return app;
}
