import fp from "fastify-plugin";

export default fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    const code = error.code;

    if (code === "P2002") {
      return reply.code(409).send({ message: "Такая запись уже существует" });
    }
    if (code === "P2003") {
      return reply
        .code(409)
        .send({ message: "Запись связана с другими данными" });
    }
    if (code === "P2025") {
      return reply.code(404).send({ message: "Запись не найдена" });
    }

    if (error.validation) {
      return reply
        .code(400)
        .send({ message: "Неверные данные", details: error.validation });
    }

    request.log.error(error);
    return reply.code(error.statusCode ?? 500).send({ message: error.message });
  });
});
