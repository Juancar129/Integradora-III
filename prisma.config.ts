import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL) {
  throw new Error("La variable de entorno DATABASE_URL no está definida");
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
