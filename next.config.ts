import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  output: "standalone",
};

export default nextConfig;
