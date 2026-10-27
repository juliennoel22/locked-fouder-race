export type ParsedBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "callout"; variant: "trap" | "memo" | "app" | "default"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; code: string; lang: string }
  | { type: "math"; math: string }
  | { type: "bullet"; text: string }
  | { type: "number"; num: string; text: string }
  | { type: "paragraph"; text: string }
  | { type: "spacer" };

export function parseMarkdownBlocks(content: string): ParsedBlock[] {
  if (!content) return [];
  const lines = content.split("\n");
  const result: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push({ type: "spacer" });
      i++;
      continue;
    }

    // 1. Code blocks (```text, ```mermaid, etc.)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      result.push({ type: "code", code: codeLines.join("\n"), lang });
      continue;
    }

    // 2. Math block ($$...$$)
    if (trimmed.startsWith("$$")) {
      let mathContent = trimmed.slice(2);
      if (mathContent.endsWith("$$") && mathContent.length >= 2) {
        result.push({ type: "math", math: mathContent.slice(0, -2).trim() });
        i++;
        continue;
      }
      const mathLines: string[] = [mathContent];
      i++;
      while (i < lines.length && !lines[i].trim().endsWith("$$")) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const lastLine = lines[i].trim();
        mathLines.push(lastLine.slice(0, -2));
        i++;
      }
      result.push({ type: "math", math: mathLines.join("\n").trim() });
      continue;
    }

    // 3. Markdown Tables (| Col 1 | Col 2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());
        const headers = parseRow(tableLines[0]);
        const contentRows = tableLines.slice(1).filter((r) => !r.replace(/[\s|:-]/g, "").length ? false : true);
        const rows = contentRows.map(parseRow);
        result.push({ type: "table", headers, rows });
        continue;
      }
    }

    // 4. Headings
    if (trimmed.startsWith("# ")) {
      result.push({ type: "h1", text: trimmed.substring(2) });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      result.push({ type: "h2", text: trimmed.substring(3) });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      result.push({ type: "h3", text: trimmed.substring(4) });
      i++;
      continue;
    }

    // 5. Callouts & Blockquotes (> ...)
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.substring(2).trim();
      let variant: "trap" | "memo" | "app" | "default" = "default";
      if (quoteText.includes("⚠️") || /pi[èe]ge/i.test(quoteText) || /attention/i.test(quoteText)) {
        variant = "trap";
      } else if (quoteText.includes("💡") || /m[ée]mo/i.test(quoteText) || /mn[ée]motechnique/i.test(quoteText) || /astuce/i.test(quoteText)) {
        variant = "memo";
      } else if (quoteText.includes("🎯") || /application/i.test(quoteText) || /exemple/i.test(quoteText) || /cas pratique/i.test(quoteText)) {
        variant = "app";
      }
      result.push({ type: "callout", variant, text: quoteText });
      i++;
      continue;
    }

    // 6. Bullets (- or * or •)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      result.push({ type: "bullet", text: trimmed.substring(2) });
      i++;
      continue;
    }

    // 7. Numbered lists (1. Item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      result.push({ type: "number", num: numMatch[1], text: numMatch[2] });
      i++;
      continue;
    }

    // 8. Regular paragraph
    result.push({ type: "paragraph", text: line });
    i++;
  }

  return result;
}
