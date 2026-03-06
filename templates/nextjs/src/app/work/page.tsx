import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { baseURL } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { fetchPortfolio } from "@/lib/api";
import { toPerson, toAbout } from "@/lib/portfolio";
import { getProjects } from "@/utils/utils";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const data = await fetchPortfolio();
  if (!data) return {};
  const person = toPerson(data);
  return Meta.generate({
    title: `Projects — ${person.name}`,
    description: `Projects by ${person.name}`,
    baseURL: baseURL,
    image: `/api/og/generate?title=Projects`,
    path: "/work",
  });
}

export default async function Work() {
  const data = await fetchPortfolio();
  if (!data) notFound();

  const person = toPerson(data);
  const about = toAbout(data);
  const projects = await getProjects();

  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path="/work"
        title={`Projects — ${person.name}`}
        description={`Projects by ${person.name}`}
        image={`/api/og/generate?title=Projects`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: person.avatar,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        Projects — {person.name}
      </Heading>
      <Projects posts={projects} />
    </Column>
  );
}
