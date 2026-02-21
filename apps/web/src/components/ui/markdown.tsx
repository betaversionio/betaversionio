"use client";

import { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

function MermaidDiagram({ code }: { code: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setSvg("");
    setError("");

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
        });
        const { svg } = await mermaid.render(
          `mermaid-${id.replace(/:/g, "")}-${resolvedTheme}`,
          code,
        );
        if (!cancelled) setSvg(svg);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to render diagram",
          );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, id, resolvedTheme]);

  if (error) {
    return (
      <pre className="mt-6 overflow-x-auto rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
        <code>{code}</code>
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex justify-center">
        <div className="h-24 w-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div
      className="my-6 flex justify-center overflow-x-auto [&>svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const sizeMap = {
  default: {
    h1: "mt-12 text-3xl",
    h2: "mt-10 text-2xl",
    h3: "mt-8 text-xl",
    h4: "mt-6 text-lg",
    p: "leading-7 [&:not(:first-child)]:mt-6",
    ul: "my-6",
    ol: "my-6",
    li: "",
    blockquote: "mt-6",
    code: "text-sm",
    pre: "mt-6 p-4",
    hr: "my-8",
  },
  sm: {
    h1: "mt-8 text-2xl",
    h2: "mt-6 text-xl",
    h3: "mt-5 text-lg",
    h4: "mt-4 text-base",
    p: "text-sm leading-6 [&:not(:first-child)]:mt-4",
    ul: "my-4",
    ol: "my-4",
    li: "text-sm",
    blockquote: "mt-4",
    code: "text-xs",
    pre: "mt-4 p-3",
    hr: "my-6",
  },
};

interface MarkdownProps {
  content: string;
  className?: string;
  size?: "default" | "sm";
}

export function Markdown({ content, className, size = "default" }: MarkdownProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className={cn("scroll-m-20 font-bold tracking-tight first:mt-0", s.h1)}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn("scroll-m-20 border-b pb-2 font-semibold tracking-tight first:mt-0", s.h2)}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn("scroll-m-20 font-semibold tracking-tight", s.h3)}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={cn("scroll-m-20 font-semibold tracking-tight", s.h4)}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className={cn("text-muted-foreground", s.p)}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={cn("ml-6 list-disc [&>li]:mt-2", s.ul)}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className={cn("ml-6 list-decimal [&>li]:mt-2", s.ol)}>{children}</ol>
          ),
          li: ({ children }) => (
            <li className={cn("text-muted-foreground", s.li)}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={cn("border-l-4 border-primary pl-6 italic text-muted-foreground", s.blockquote)}>
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-primary underline underline-offset-4 hover:no-underline"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          hr: () => <hr className={cn("border-border", s.hr)} />,
          code: ({ children }) => (
            <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono", s.code)}>
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-6 w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b bg-muted/50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">{children}</tbody>
          ),
          tr: ({ children }) => <tr className="transition-colors hover:bg-muted/30">{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-foreground">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-muted-foreground">{children}</td>
          ),
          pre: ({ children, node }) => {
            // Detect mermaid code blocks from the hast AST
            const codeChild = node?.children?.[0];
            if (
              codeChild &&
              "tagName" in codeChild &&
              codeChild.tagName === "code" &&
              "properties" in codeChild
            ) {
              const classNames = (
                codeChild as { properties?: { className?: string[] } }
              ).properties?.className;
              if (
                Array.isArray(classNames) &&
                classNames.some((c) => String(c) === "language-mermaid")
              ) {
                const text = (
                  codeChild as { children?: { type: string; value?: string }[] }
                ).children
                  ?.filter((c) => c.type === "text")
                  .map((c) => c.value ?? "")
                  .join("");
                return <MermaidDiagram code={text ?? ""} />;
              }
            }
            return (
              <pre className={cn("overflow-x-auto rounded-lg bg-muted", s.pre)}>
                {children}
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
