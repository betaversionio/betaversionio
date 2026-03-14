import { notFound } from 'next/navigation';
import { source } from '@/lib/source';
import { mdxComponents } from '../../../../mdx-components';

export const revalidate = false;
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  return {
    title: `${page.data.title} - Docs - BetaVersion.IO`,
    description: page.data.description,
  };
}

export default async function DocsPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
          {page.data.title}
        </h1>
        {page.data.description && (
          <p className="text-muted-foreground text-balance">
            {page.data.description}
          </p>
        )}
      </div>
      <div className="w-full flex-1">
        <MDX components={mdxComponents} />
      </div>
    </>
  );
}
