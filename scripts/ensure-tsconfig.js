/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const tsconfigPath = path.join(__dirname, "..", "tsconfig.json");

if (!fs.existsSync(tsconfigPath)) {
  const template = {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: false,
      noEmit: true,
      incremental: true,
      module: "esnext",
      esModuleInterop: true,
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      paths: {
        "@/*": ["./src/*"],
      },
      plugins: [
        {
          name: "next",
        },
      ],
    },
    include: [
      "next-env.d.ts",
      ".next/types/**/*.ts",
      ".next/dev/types/**/*.ts",
      "**/*.mts",
      "**/*.ts",
      "**/*.tsx",
    ],
    exclude: ["node_modules"],
  };

  fs.writeFileSync(tsconfigPath, JSON.stringify(template, null, 2) + "\n");
  console.log("Automatically restored tsconfig.json with @/* path aliases.");
}
