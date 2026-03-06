import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery } from "@/resources";
import { fetchPortfolio } from "@/lib/api";
import { toPerson } from "@/lib/portfolio";

export async function generateMetadata() {
  try {
    const data = await fetchPortfolio();
    const person = toPerson(data);
    return Meta.generate({
      title: `${gallery.title} — ${person.name}`,
      description: gallery.description,
      baseURL: baseURL,
      image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
      path: gallery.path,
    });
  } catch {
    return Meta.generate({
      title: gallery.title,
      description: gallery.description,
      baseURL: baseURL,
      image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
      path: gallery.path,
    });
  }
}

export default async function Gallery() {
  let personName = "Portfolio";
  let personAvatar = "";
  try {
    const data = await fetchPortfolio();
    const person = toPerson(data);
    personName = person.name;
    personAvatar = person.avatar;
  } catch {}

  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: personName,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${personAvatar}`,
        }}
      />
      <GalleryView />
    </Flex>
  );
}
