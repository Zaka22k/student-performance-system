import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public",
);

export default fp(async (app) => {
  await app.register(fastifyStatic, { root });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api")) {
      return reply.code(404).send({ message: "Не найдено" });
    }
    return reply.sendFile("index.html");
  });
});
