import { readFile } from "node:fs/promises";
import { relative, sep } from "node:path";

import { renderSvelteDocument } from "./lib/server/svelte-document.js";

import type { CtrlAltDocConfig } from "./index.js";

export interface CtrlAltDocVitePluginOptions {
  config: CtrlAltDocConfig;
}

export function ctrlAltDoc(options: CtrlAltDocVitePluginOptions) {
  let root = process.cwd();

  return {
    name: "ctrl-alt-doc-documents",
    enforce: "pre" as const,
    configResolved(resolvedConfig: { root: string }) {
      root = resolvedConfig.root;
    },
    async transform(_code: string, id: string) {
      const file = id.split("?", 1)[0];

      if (!file.endsWith(".md") || file.includes("/node_modules/")) {
        return undefined;
      }

      const source = await readFile(file, "utf8");
      const docsRoot = `${root}${sep}docs`;
      const relativePath = relative(docsRoot, file).split(sep).join("/");
      const slug = relativePath
        .replace(/\/index\.md$/, "")
        .replace(/\.md$/, "");
      const component = await renderSvelteDocument(
        source,
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
