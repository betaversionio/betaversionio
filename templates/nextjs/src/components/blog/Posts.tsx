import { Grid } from "@once-ui-system/core";
import Post from "./Post";
import type { Post as PostType } from "@/utils/utils";

interface PostsProps {
  posts: PostType[];
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
  author?: { name: string; avatar: string };
}

export function Posts({
  posts,
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
  author,
}: PostsProps) {
  let allBlogs = [...posts];

  if (exclude.length) {
    allBlogs = allBlogs.filter((post) => !exclude.includes(post.slug));
  }

  const sortedBlogs = allBlogs.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedBlogs = range
    ? sortedBlogs.slice(range[0] - 1, range.length === 2 ? range[1] : sortedBlogs.length)
    : sortedBlogs;

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid columns={columns} s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
          {displayedBlogs.map((post) => (
            <Post
              key={post.slug}
              post={post}
              thumbnail={thumbnail}
              direction={direction}
              author={author}
            />
          ))}
        </Grid>
      )}
    </>
  );
}
