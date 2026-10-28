import { ZodError, type ZodType } from "zod";
import { prisma } from "./prisma";

const nest = (path: string, condition: unknown) =>
  path
    .split(".")
    .reduceRight<unknown>((acc, key) => ({ [key]: acc }), condition);

export interface SearchConfig {
  textFields?: string[];
  numberFields?: string[];
}

export function buildSearchWhere(
  q?: string,
  { textFields = [], numberFields = [] }: SearchConfig = {},
) {
  const tokens = String(q ?? "")
    .trim()
    .slice(0, 100)
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return undefined;

  return {
    AND: tokens.map((token) => {
      const conditions: Record<string, unknown>[] = textFields.map(
        (path) =>
          nest(path, { startsWith: token, mode: "insensitive" }) as Record<
            string,
            unknown
          >,
      );
      if (/^\d{1,9}$/.test(token)) {
        for (const field of numberFields)
          conditions.push({ [field]: Number(token) });
      }
      return { OR: conditions };
    }),
  };
}

export interface CrudMessages {
  notFound: string;
  unique?: string;
  inUse?: string;
  foreignKey?: string;
}

export async function withActionError<T>(
  fn: () => Promise<T>,
  messages: CrudMessages,
  action: "read" | "create" | "update" | "delete" = "create",
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error instanceof ZodError) {
      throw new Error(error.issues[0]?.message ?? "Неверные данные");
    }
    if (error?.code === "P2002") {
      throw new Error(messages.unique ?? "Такая запись уже существует");
    }
    if (error?.code === "P2003") {
      throw new Error(
        action === "delete"
          ? (messages.inUse ?? "Запись связана с другими данными")
          : (messages.foreignKey ?? "Неверные связанные данные"),
      );
    }
    if (error?.code === "P2025") {
      throw new Error(messages.notFound);
    }
    throw error;
  }
}

export interface CrudConfig<TInput, TDto> {
  model: keyof typeof prisma;
  idField: string;
  orderBy?: unknown;
  include?: unknown;
  search?: SearchConfig;
  schema: ZodType<TInput>;
  dateFields?: string[];
  toDto?: (row: any) => TDto;
  validate?: (data: TInput) => string | undefined | null;
  messages: CrudMessages;
}

export function createCrudService<TInput, TDto>(cfg: CrudConfig<TInput, TDto>) {
  const {
    model,
    idField,
    orderBy,
    include,
    search,
    schema,
    dateFields = [],
    toDto = (row) => row,
    validate,
    messages,
  } = cfg;

  const delegate = () => (prisma as any)[model];

  const where = (id: string | number | bigint) => {
    const str = String(id ?? "").trim();
    if (!/^\d+$/.test(str)) {
      throw new Error(messages.notFound);
    }
    return { [idField]: BigInt(str) };
  };

  const formatRow = (row: any): TDto => {
    const copy = { ...row };
    for (const [k, v] of Object.entries(copy)) {
      if (typeof v === "bigint") {
        copy[k] = String(v);
      } else if (v instanceof Date) {
        if (dateFields.includes(k)) copy[k] = v.toISOString().slice(0, 10);
      } else if (
        v !== null &&
        typeof v === "object" &&
        "toNumber" in v &&
        typeof (v as any).toNumber === "function"
      ) {
        copy[k] = (v as any).toNumber();
      }
    }
    return toDto(copy);
  };

  return {
    async list(q?: string): Promise<TDto[]> {
      const rows = await delegate().findMany({
        where: buildSearchWhere(q, search),
        orderBy,
        include,
      });
      return rows.map(formatRow);
    },

    async getById(id: string): Promise<TDto> {
      return withActionError(
        async () => {
          const row = await delegate().findUnique({
            where: where(id),
            include,
          });
          if (!row) throw new Error(messages.notFound);
          return formatRow(row);
        },
        messages,
        "read",
      );
    },

    async create(rawInput: unknown): Promise<TDto> {
      return withActionError(
        async () => {
          const data = schema.parse(rawInput);
          const problem = validate?.(data);
          if (problem) throw new Error(problem);
          const row = await delegate().create({ data, include });
          return formatRow(row);
        },
        messages,
        "create",
      );
    },

    async update(id: string, rawInput: unknown): Promise<TDto> {
      return withActionError(
        async () => {
          const data = schema.parse(rawInput);
          const problem = validate?.(data);
          if (problem) throw new Error(problem);
          const row = await delegate().update({
            where: where(id),
            data,
            include,
          });
          return formatRow(row);
        },
        messages,
        "update",
      );
    },

    async remove(id: string): Promise<void> {
      return withActionError(
        async () => {
          await delegate().delete({ where: where(id) });
        },
        messages,
        "delete",
      );
    },
  };
}
