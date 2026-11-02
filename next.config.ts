import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

const tsconfigPath = path.resolve(process.cwd(), "tsconfig.json");
if (!fs.existsSync(tsconfigPath)) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./scripts/ensure-tsconfig.js");
  } catch {}
}

const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_DEPLOYMENT_ID);

const nextConfig: NextConfig = {
  ...(isVercel
    ? {}
    : {
        experimental: {
          turbopackPluginRuntimeStrategy: "forceWorkerThreads",
        },
      }),
};

export default nextConfig;
