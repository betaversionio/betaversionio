import {
  Heading,
  Text,
  Button,
  Avatar,
  RevealFx,
  Column,
  Row,
  Schema,
  Meta,
  Line,
} from "@once-ui-system/core";
import { baseURL, routes } from "@/resources";
import { Mailchimp } from "@/components";
import { Projects } from "@/components/work/Projects";
import { Posts } from "@/components/blog/Posts";
import { fetchPortfolio } from "@/lib/api";
import { toPerson, toHome, toAbout } from "@/lib/portfolio";
import { getProjects, getBlogs } from "@/utils/utils";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const data = await fetchPortfolio();
  if (!data) return {};
  const home = toHome(data);
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function Home() {
  const data = await fetchPortfolio();
  if (!data) notFound();

  const person = toPerson(data);
  const home = toHome(data);
  const about = toAbout(data);
  const projects = await getProjects();
  const blogs = await getBlogs();

  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={person.avatar}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: person.avatar,
        }}
      />
      <Column fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="16" paddingTop="24">
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="32">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline}
            </Text>
          </RevealFx>
          <RevealFx paddingTop="12" delay={0.4} horizontal="center" paddingLeft="12">
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              weight="default"
              arrowIcon
            >
              <Row gap="8" vertical="center" paddingRight="4">
                {person.avatar && (
                  <Avatar
                    marginRight="8"
                    style={{ marginLeft: "-0.75rem" }}
                    src={person.avatar}
                    size="m"
                  />
                )}
                {about.title}
              </Row>
            </Button>
          </RevealFx>
        </Column>
      </Column>
      {projects.length > 0 && (
        <RevealFx translateY="16" delay={0.6}>
          <Projects posts={projects} range={[1, 1]} />
        </RevealFx>
      )}
      {routes["/blog"] && blogs.length > 0 && (
        <Column fillWidth gap="24" marginBottom="l">
          <Row fillWidth paddingRight="64">
            <Line maxWidth={48} />
          </Row>
          <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} paddingLeft="l" paddingTop="24">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Latest from the blog
              </Heading>
            </Row>
            <Row flex={3} paddingX="20">
              <Posts
                posts={blogs}
                range={[1, 2]}
                columns="2"
                author={{ name: person.name, avatar: person.avatar }}
              />
            </Row>
          </Row>
          <Row fillWidth paddingLeft="64" horizontal="end">
            <Line maxWidth={48} />
          </Row>
        </Column>
      )}
      {projects.length > 1 && <Projects posts={projects} range={[2]} />}
      <Mailchimp />
    </Column>
  );
}
