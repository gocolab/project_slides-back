import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  serverExternalPackages: ["playwright", "sharp", "pdf-lib"],
  transpilePackages: ["../../scripts", "../../src"],
};

export default nextConfig;
