import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL } from "@/resources";
import { fetchPortfolio } from "@/lib/api";
import { toPerson } from "@/lib/portfolio";
import { getBlogs } from "@/utils/utils";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const data = await fetchPortfolio();
  if (!data) return {};
  const person = toPerson(data);
  return Meta.generate({
    title: `Blog — ${person.name}`,
    description: `Read what ${person.name} has been writing about`,
    baseURL: baseURL,
    image: `/api/og/generate?title=Blog`,
    path: "/blog",
  });
}

export default async function Blog() {
  const data = await fetchPortfolio();
  if (!data) notFound();

  const person = toPerson(data);
  const blogs = await getBlogs();
  const author = { name: person.name, avatar: person.avatar };

  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={`Blog — ${person.name}`}
        description={`Read what ${person.name} has been writing about`}
        path="/blog"
        image={`/api/og/generate?title=Blog`}
        author={{
          name: person.name,
          url: `${baseURL}/blog`,
          image: person.avatar,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
        Blog
      </Heading>
      <Column fillWidth flex={1} gap="40">
        <Posts posts={blogs} range={[1, 1]} thumbnail author={author} />
        <Posts posts={blogs} range={[2, 3]} columns="2" thumbnail direction="column" author={author} />
        <Mailchimp marginBottom="l" />
        {blogs.length > 3 && (
          <>
            <Heading as="h2" variant="heading-strong-xl" marginLeft="l">
              Earlier posts
            </Heading>
            <Posts posts={blogs} range={[4]} columns="2" author={author} />
          </>
        )}
      </Column>
    </Column>
  );
}
