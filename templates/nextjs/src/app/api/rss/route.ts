import { getPosts } from "@/utils/utils";
import { baseURL, blog } from "@/resources";
import { fetchPortfolio } from "@/lib/api";
import { toPerson } from "@/lib/portfolio";
import { NextResponse } from "next/server";

export async function GET() {
  let personName = "Portfolio";
  let personEmail = "noreply@example.com";
  let personAvatar = "/images/avatar.jpg";
  try {
    const data = await fetchPortfolio();
    if (data) {
      const person = toPerson(data);
      personName = person.name || personName;
      personEmail = person.email || personEmail;
      personAvatar = person.avatar || personAvatar;
    }
  } catch {}

  const posts = getPosts(["src", "app", "blog", "posts"]);

  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${blog.title} — ${personName}</title>
    <link>${baseURL}/blog</link>
    <description>${blog.description}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseURL}/api/rss" rel="self" type="application/rss+xml" />
    <managingEditor>${personEmail} (${personName})</managingEditor>
    <webMaster>${personEmail} (${personName})</webMaster>
    <image>
      <url>${baseURL}${personAvatar}</url>
      <title>${blog.title}</title>
      <link>${baseURL}/blog</link>
    </image>
    ${sortedPosts
      .map(
        (post) => `
    <item>
      <title>${post.metadata.title}</title>
      <link>${baseURL}/blog/${post.slug}</link>
      <guid>${baseURL}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.metadata.summary}]]></description>
      ${post.metadata.image ? `<enclosure url="${baseURL}${post.metadata.image}" type="image/jpeg" />` : ""}
      ${post.metadata.tag ? `<category>${post.metadata.tag}</category>` : ""}
      <author>${personEmail} (${personName})</author>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  // Return the RSS XML with the appropriate content type
  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
