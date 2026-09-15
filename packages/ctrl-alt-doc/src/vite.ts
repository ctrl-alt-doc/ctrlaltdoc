import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

import { renderSvelteDocument } from "./lib/server/svelte-document.js";
import { getUpdateNotice } from "./lib/server/update-check.js";

import type { CtrlAltDocConfig } from "./index.js";

export interface CtrlAltDocVitePluginOptions {
  config: CtrlAltDocConfig;
}

const contentModuleId = "ctrl-alt-doc/content";
const resolvedContentModuleId = `\0${contentModuleId}`;
const contentExtensions = new Set([".md", ".yml", ".yaml"]);

function isDocsMarkdown(file: string, root: string): boolean {
  if (!file.endsWith(".md") || file.includes("/node_modules/")) {
    return false;
  }

  const path = relative(join(root, "docs"), file);

  return path !== "" && path !== ".." && !path.startsWith(`..${sep}`);
}

async function findContentFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findContentFiles(path)));
    } else if (entry.isFile() && contentExtensions.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files.sort();
}

export function ctrlAltDoc(options: CtrlAltDocVitePluginOptions) {
  let root = process.cwd();

  return {
    name: "ctrl-alt-doc-documents",
    enforce: "pre" as const,
    configResolved(resolvedConfig: { root: string }) {
      root = resolvedConfig.root;
    },
    configureServer(server: {
      config: { logger: { info(message: string): void } };
    }) {
      void getUpdateNotice(root).then((notice) => {
        if (notice) {
          server.config.logger.info(notice);
        }
      });
    },
    resolveId(id: string) {
      if (id === contentModuleId) {
        return resolvedContentModuleId;
      }
    },
    async load(this: { addWatchFile(file: string): void }, id: string) {
      if (id === resolvedContentModuleId) {
        const docsRoot = join(root, "docs");
        let files: string[];

        try {
          files = await findContentFiles(docsRoot);
        } catch {
          throw new Error(
            `ctrl alt doc could not find the docs directory at ${docsRoot}.`,
          );
        }

        const homepage = join(docsRoot, "index.md");

        if (!files.includes(homepage)) {
          throw new Error(`ctrl alt doc requires a homepage at ${homepage}.`);
        }

        const manifest: Record<string, string> = {};

        for (const file of files) {
          this.addWatchFile(file);
          const path = relative(root, file).split(sep).join("/");
          manifest[path] = await readFile(file, "utf8");
        }

        return `export default ${JSON.stringify(manifest)};`;
      }

      const file = id.split("?", 1)[0];

      if (!isDocsMarkdown(file, root)) {
        return undefined;
      }

      try {
        return await readFile(file, "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return "";
        }

        throw error;
      }
    },
    async transform(code: string, id: string) {
      const file = id.split("?", 1)[0];

      if (!isDocsMarkdown(file, root)) {
        return undefined;
      }

      const docsRoot = `${root}${sep}docs`;
      const relativePath = relative(docsRoot, file).split(sep).join("/");
      const resolvedSlug = relativePath
        .replace(/\/index\.md$/, "")
        .replace(/\.md$/, "");
      const slug = resolvedSlug === "index" ? "" : resolvedSlug;
      const component = await renderSvelteDocument(
        code,
        options.config,
        slug,
      );

      return {
        code: component,
        map: null,
      };
    },
  };
}
