import { Link } from 'react-router-dom';
import type { PortfolioBlog } from '../lib/api';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface BlogProps {
  blogs: PortfolioBlog[];
  active: boolean;
}

export function Blog({ blogs, active }: BlogProps) {
  return (
    <article className={`blog ${active ? 'active' : ''}`} data-page="blog">
      <header>
        <h2 className="h2 article-title">Blog</h2>
      </header>

      <section className="blog-posts">
        <ul className="blog-posts-list">
          {blogs.map((blog) => (
            <li key={blog.id} className="blog-post-item">
              <Link to={`/blog/${blog.slug}`}>
                {blog.coverImage && (
                  <figure className="blog-banner-box">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      loading="lazy"
                    />
                  </figure>
                )}

                <div className="blog-content">
                  <div className="blog-meta">
                    <p className="blog-category">
                      {blog.tags[0] ?? 'Article'}
                    </p>
                    <span className="dot"></span>
                    <time dateTime={blog.createdAt}>
                      {formatDate(blog.createdAt)}
                    </time>
                  </div>

                  <h3 className="h3 blog-item-title">{blog.title}</h3>

                  {blog.excerpt && (
                    <p className="blog-text">{blog.excerpt}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {blogs.length === 0 && (
          <p style={{ color: 'var(--light-gray)', textAlign: 'center' }}>
            No blog posts yet.
          </p>
        )}
      </section>
    </article>
  );
}
