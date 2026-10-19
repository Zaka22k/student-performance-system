// Общая фабрика CRUD-маршрутов для справочников.
// Каждый справочник описывается конфигом (см. routes/groups.js и т. д.).

export const idParams = {
  type: "object",
  properties: { id: { type: "string", pattern: "^[0-9]+$" } },
  required: ["id"],
};

// "student_groups.group_code" -> { student_groups: { group_code: condition } }
const nest = (path, condition) =>
  path.split(".").reduceRight((acc, key) => ({ [key]: acc }), condition);

/**
 * Условие поиска по строке q.
 * Строка делится на слова; каждое слово должно найтись хотя бы в одном поле (без учёта регистра).
 * Целые числа дополнительно сравниваются с числовыми полями (год набора, номер семестра и т. п.).
 */
export function buildSearchWhere(q, { textFields = [], numberFields = [] } = {}) {
  const tokens = String(q ?? "").trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return undefined;

  return {
    AND: tokens.map((token) => {
      const conditions = textFields.map((path) =>
        nest(path, { contains: token, mode: "insensitive" }),
      );
      if (/^\d{1,9}$/.test(token)) {
        for (const field of numberFields) conditions.push({ [field]: Number(token) });
      }
      return { OR: conditions };
    }),
  };
}

// Тело запроса -> данные для Prisma
export function prepareData(body, { nullable = [], dateFields = [], bigintFields = [], decimalFields = [] }) {
  const data = {};
  for (const [key, raw] of Object.entries(body)) {
    let value = typeof raw === "string" ? raw.trim() : raw;
    if (value === "" && nullable.includes(key)) value = null;
    if (value !== null && value !== undefined) {
      if (dateFields.includes(key)) value = new Date(value);
      else if (bigintFields.includes(key)) value = BigInt(value);
      else if (decimalFields.includes(key)) value = Math.round(value * 10) / 10;
    }
    data[key] = value;
  }
  return data;
}

export function registerCrud(app, cfg) {
  const {
    model,
    idField,
    orderBy,
    include,
    search,
    bodySchema,
    nullable = [],
    dateFields = [],
    bigintFields = [],
    decimalFields = [],
    toDto = (row) => row,
    validate,
    messages,
  } = cfg;

  const delegate = () => app.prisma[model];

  const dto = (row) => {
    const out = toDto(row);
    for (const field of dateFields) {
      if (out[field] instanceof Date) out[field] = out[field].toISOString().slice(0, 10);
    }
    return out;
  };

  // Ошибки БД, которые понятны пользователю; остальные уходят в общий обработчик
  const dbError = (error, reply, action) => {
    if (error.code === "P2002") return reply.code(409).send({ message: messages.unique });
    if (error.code === "P2003") {
      return action === "delete"
        ? reply.code(409).send({ message: messages.inUse })
        : reply.code(400).send({ message: messages.foreignKey });
    }
    if (error.code === "P2025") return reply.code(404).send({ message: messages.notFound });
    throw error;
  };

  const where = (id) => ({ [idField]: BigInt(id) });

  // Список с поиском
  app.get(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: { q: { type: "string", maxLength: 100 } },
        },
      },
    },
    async (request) => {
      const rows = await delegate().findMany({
        where: buildSearchWhere(request.query.q, search),
        orderBy,
        include,
      });
      return rows.map(dto);
    },
  );

  // Одна запись
  app.get("/:id", { schema: { params: idParams } }, async (request, reply) => {
    const row = await delegate().findUnique({ where: where(request.params.id), include });
    if (!row) return reply.code(404).send({ message: messages.notFound });
    return dto(row);
  });

  // Добавление
  app.post("/", { schema: { body: bodySchema } }, async (request, reply) => {
    const data = prepareData(request.body, { nullable, dateFields, bigintFields, decimalFields });
    const problem = validate?.(data);
    if (problem) return reply.code(400).send({ message: problem });

    try {
      const row = await delegate().create({ data, include });
      return reply.code(201).send(dto(row));
    } catch (error) {
      return dbError(error, reply, "create");
    }
  });

  // Изменение (передаётся вся запись целиком)
  app.put(
    "/:id",
    { schema: { params: idParams, body: bodySchema } },
    async (request, reply) => {
      const data = prepareData(request.body, { nullable, dateFields, bigintFields, decimalFields });
      const problem = validate?.(data);
      if (problem) return reply.code(400).send({ message: problem });

      try {
        const row = await delegate().update({ where: where(request.params.id), data, include });
        return dto(row);
      } catch (error) {
        return dbError(error, reply, "update");
      }
    },
  );

  // Удаление
  app.delete("/:id", { schema: { params: idParams } }, async (request, reply) => {
    try {
      await delegate().delete({ where: where(request.params.id) });
      return reply.code(204).send();
    } catch (error) {
      return dbError(error, reply, "delete");
    }
  });
}
