"use client";

interface FormattedAiTextProps {
  content: string;
  isStreaming?: boolean;
}

export function FormattedAiText({ content, isStreaming }: FormattedAiTextProps) {
  const lines = content.split("\n");

  const renderInline = (str: string) => {
    // Parser **gras**, *italique*, et `code`
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-black">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic text-zinc-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1 py-0.5 rounded bg-zinc-200/80 font-mono text-[11px] text-black"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Listes à puces (- ou • ou *)
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-black font-bold select-none">•</span>
              <span>{renderInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Listes numérotées (1., 2., etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="font-bold text-black select-none">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Titres ###
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-black text-[13px] pt-1 pb-0.5">
              {renderInline(trimmed.substring(4))}
            </h4>
          );
        }

        // Paragraphe standard
        return (
          <p key={idx}>
            {renderInline(line)}
            {isStreaming && idx === lines.length - 1 && (
              <span className="inline-block w-1.5 h-3 bg-black ml-1 animate-pulse align-middle" />
            )}
          </p>
        );
      })}
    </div>
  );
}
