'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownProps {
    content: string;
    className?: string;
}

export const Markdown = memo(function Markdown({ content, className }: MarkdownProps) {
    return (
        <div className={cn('prose prose-invert max-w-none', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mt-12 text-3xl scroll-m-20 font-bold tracking-tight first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mt-10 text-2xl scroll-m-20 border-b border-border pb-2 font-semibold tracking-tight first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-8 text-xl scroll-m-20 font-semibold tracking-tight">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="mt-6 text-lg scroll-m-20 font-semibold tracking-tight">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="text-muted-foreground leading-7 [&:not(:first-child)]:mt-6">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-muted-foreground">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
                            {children}
                        </blockquote>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                            target={href?.startsWith('http') ? '_blank' : undefined}
                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                            {children}
                        </a>
                    ),
                    hr: () => <hr className="my-8 border-border" />,
                    code: ({ children }) => (
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm text-muted-foreground">
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="mt-6 overflow-x-auto rounded-lg bg-muted p-4">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="my-6 w-full overflow-x-auto">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="border-b bg-muted/50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="transition-colors hover:bg-muted/30">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-semibold text-foreground">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-muted-foreground">{children}</td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});
