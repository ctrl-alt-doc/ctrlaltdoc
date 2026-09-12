import matter from "gray-matter";

import { getDocCards } from "./documents.js";
import { renderMarkdown } from "./markdown.js";

import type { CtrlAltDocConfig } from "../../index.js";

interface ImportedComponent {
  name: string;
}

function getImportedComponents(script: string): ImportedComponent[] {
  const components: ImportedComponent[] = [];
  const importPattern =
    /import\s+([A-Z][A-Za-z0-9_$]*)\s+from\s+['"][^'"]+['"]\s*;?/g;

  for (const match of script.matchAll(importPattern)) {
    components.push({ name: match[1] });
  }

  return components;
}

function replaceComponents(
  content: string,
  components: ImportedComponent[],
): { markdown: string; tags: string[] } {
  const names = components.map(({ name }) => name);

  if (!names.length) {
    return { markdown: content, tags: [] };
  }

  const tagPattern = new RegExp(
    `<(${names.join("|")})\\b[^>]*?(?:\\/>|>[^<]*<\\/\\1>)`,
    "g",
  );
  const tags: string[] = [];
  const lines = content.split("\n");
  let fence: string | undefined;

  const markdown = lines
    .map((line) => {
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);

      if (fenceMatch) {
        if (!fence) {
          fence = fenceMatch[1][0];
        } else if (fenceMatch[1][0] === fence) {
          fence = undefined;
        }

        return line;
      }

      if (fence) {
        return line;
      }

      return line.replace(tagPattern, (tag) => {
        const index = tags.push(tag) - 1;
        return `<!--CAD_SVELTE_COMPONENT_${index}-->`;
      });
    })
    .join("\n");

  return { markdown, tags };
}

export async function renderSvelteDocument(
  source: string,
  config: CtrlAltDocConfig,
  slug = "",
): Promise<string> {
  const { content } = matter(source);
  const scriptMatch = content.match(
    /^\s*<script(?:\s[^>]*)?>[\s\S]*?<\/script>\s*/,
  );
  const script = scriptMatch?.[0] ?? "";
  const markdownContent = scriptMatch
    ? content.slice(scriptMatch[0].length)
    : content;
  const importedComponents = getImportedComponents(script);
  const extracted = replaceComponents(markdownContent, importedComponents);
  const rendered = await renderMarkdown(extracted.markdown, {
    slug,
    callouts: config.callouts,
    icons: config.icons,
    docCards: await getDocCards(slug),
  });

  let documentContent = rendered.content
    .replaceAll("{", "&#123;")
    .replaceAll("}", "&#125;");

  for (let index = 0; index < extracted.tags.length; index++) {
    documentContent = documentContent.replace(
      `<!--CAD_SVELTE_COMPONENT_${index}-->`,
      extracted.tags[index],
    );
  }

  return `${script}${documentContent}`;
}
