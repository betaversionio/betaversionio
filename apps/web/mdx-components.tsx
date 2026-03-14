import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';
import { Callout } from '@/components/docs/mdx';
import { CopyButton } from '@/components/docs/copy-button';

export const mdxComponents: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        'mt-2 scroll-m-28 text-3xl font-bold tracking-tight',
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        'mt-10 scroll-m-28 border-b pb-2 text-xl font-medium tracking-tight first:mt-0 lg:mt-16 [&+p]:!mt-4',
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        'mt-8 scroll-m-28 text-lg font-medium tracking-tight [&+p]:!mt-4',
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        'mt-6 scroll-m-28 text-base font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn('font-medium underline underline-offset-4', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        'leading-relaxed [&:not(:first-child)]:mt-6',
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn('font-medium', className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn('my-6 ml-6 list-disc', className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn('mt-2', className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    />
  ),
  hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
  table: ({ className, ...props }) => (
    <div className="my-6 w-full overflow-y-auto rounded-lg border">
      <table
        className={cn(
          'relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0',
          className,
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }) => (
    <tr className={cn('m-0 border-b', className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        'px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        'px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  ),
  figure: ({ className, ...props }) => (
    <figure className={cn(className)} {...props} />
  ),
  figcaption: ({ className, children, ...props }) => (
    <figcaption
      className={cn(
        'text-code-foreground flex items-center gap-2 border-b border-border/30 px-4 py-2.5 font-mono text-sm',
        className,
      )}
      {...props}
    >
      {children}
    </figcaption>
  ),
  pre: ({
    className,
    __rawString__,
    ...props
  }: React.ComponentProps<'pre'> & { __rawString__?: string }) => (
    <div className="relative">
      {__rawString__ && <CopyButton value={__rawString__} />}
      <pre
        className={cn(
          'overflow-x-auto px-4 py-3.5 text-sm leading-relaxed outline-none',
          className,
        )}
        {...props}
      />
    </div>
  ),
  code: ({
    className,
    ...props
  }: React.ComponentProps<'code'> & Record<string, unknown>) => {
    if (typeof props.children === 'string') {
      return (
        <code
          className={cn(
            'bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none',
            className,
          )}
          {...props}
        />
      );
    }
    return <code className={cn(className)} {...props} />;
  },
  img: ({ className, alt, ...props }) => (
    <img className={cn('rounded-md', className)} alt={alt} {...props} />
  ),
  Callout,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
