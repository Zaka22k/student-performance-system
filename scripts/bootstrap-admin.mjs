import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { Pool } from "pg";

const scrypt = promisify(scryptCallback);
const username = process.env.BOOTSTRAP_ADMIN_USERNAME?.trim();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Не задана переменная DATABASE_URL");
}
if (!username || !/^[a-zA-Z0-9._-]{3,80}$/.test(username)) {
  throw new Error("Задайте BOOTSTRAP_ADMIN_USERNAME (3–80 символов: латиница, цифры, . _ -)");
}
if (!password || password.length < 12 || password.length > 128) {
  throw new Error("Задайте BOOTSTRAP_ADMIN_PASSWORD длиной от 12 до 128 символов");
}

const salt = randomBytes(16).toString("hex");
const key = (await scrypt(password, salt, 64, {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
})).toString("hex");
const passwordHash = `scrypt$16384$8$1$${salt}$${key}`;

const pool = new Pool({ connectionString, max: 1 });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  // Блокировка строки базовой роли не позволяет двум параллельным
  // bootstrap-процессам одновременно создать первые админские аккаунты.
  const role = await client.query(
    "SELECT role_id FROM public.roles WHERE role_code = 'admin' FOR UPDATE",
  );
  if (role.rowCount !== 1) {
    throw new Error("Роль admin не найдена. Сначала выполните локальный SQL RBAC.");
  }

  const existing = await client.query(
    `SELECT 1
       FROM public.users u
       JOIN public.roles r ON r.role_id = u.role_id
      WHERE r.role_code = 'admin'
      LIMIT 1`,
  );
  if (existing.rowCount) {
    throw new Error("Администратор уже существует. Bootstrap разрешён только для первого admin.");
  }

  const inserted = await client.query(
    `INSERT INTO public.users (username, password_hash, role_id)
     VALUES ($1, $2, $3)
     RETURNING user_id`,
    [username, passwordHash, role.rows[0].role_id],
  );

  await client.query(
    `INSERT INTO public.audit_logs (actor_user_id, action, target_type, target_id, details)
     VALUES ($1, 'users.bootstrap_admin', 'user', $2, $3::jsonb)`,
    [inserted.rows[0].user_id, String(inserted.rows[0].user_id), JSON.stringify({ username })],
  );

  await client.query("COMMIT");
  process.stdout.write(`Создан первый администратор: ${username} (user_id=${inserted.rows[0].user_id})\n`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
