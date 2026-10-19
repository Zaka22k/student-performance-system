import "dotenv/config";
import { buildApp } from "./app.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = await buildApp();
await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
