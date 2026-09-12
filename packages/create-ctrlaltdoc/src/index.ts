#!/usr/bin/env node

import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function titleFromProjectName(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const readline =
  input.isTTY && output.isTTY ? createInterface({ input, output }) : null;
let projectName = process.argv[2];

if (!projectName && readline) {
  projectName = (await readline.question("Project directory name: ")).trim();
}

if (!projectName) {
  console.error("Usage: create-ctrlaltdoc <project-name>");
  readline?.close();
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-_]*$/i.test(projectName)) {
  console.error(
    "Project name may only contain letters, numbers, hyphens and underscores.",
  );
  readline?.close();
  process.exit(1);
}

const defaultTitle = titleFromProjectName(projectName);
const siteTitle = readline
  ? (
      await readline.question(`Documentation site title [${defaultTitle}]: `)
    ).trim() || defaultTitle
  : defaultTitle;
const githubUrl = readline
  ? (
      await readline.question(
        "GitHub repository URL [https://github.com/example]: ",
      )
    ).trim()
  : "";

readline?.close();

const target = resolve(process.cwd(), projectName);

try {
  await access(target, constants.F_OK);
  console.error(`Directory already exists: ${projectName}`);
  process.exit(1);
} catch {
  // Target does not exist; continue.
}

const packageDirectory = dirname(fileURLToPath(import.meta.url));
const template = resolve(packageDirectory, "../template");

await mkdir(target, { recursive: true });
await cp(template, target, { recursive: true });

const packageJsonPath = resolve(target, "package.json");
const packageJson = await readFile(packageJsonPath, "utf8");

await writeFile(
  packageJsonPath,
  packageJson.replace("__PROJECT_NAME__", () => projectName),
);

const configPath = resolve(target, "ctrlaltdoc.config.ts");
const config = await readFile(configPath, "utf8");

await writeFile(
  configPath,
  config
    .replace("title: 'My Docs'", () => `title: ${JSON.stringify(siteTitle)}`)
    .replace(
      "github: 'https://github.com/example'",
      () =>
        `github: ${JSON.stringify(githubUrl || "https://github.com/example")}`,
    ),
);

console.log(`Created ctrl alt doc project: ${projectName}`);
