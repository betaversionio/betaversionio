import { useParams, Link } from 'react-router-dom';
import { useBlog } from '@betaversionio/portfolio-sdk/hooks';
import { Markdown } from '../components/Markdown';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isPending, isError, error } = useBlog(slug ?? '');

  if (isPending) {
    return (
      <main>
        <article className="blog active" style={{ maxWidth: 700, margin: '60px auto' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--light-gray)' }}>
            Loading...
          </div>
        </article>
      </main>
    );
  }

  if (isError || !blog) {
    return (
      <main>
        <article className="blog active" style={{ maxWidth: 700, margin: '60px auto' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--bittersweet-shimmer)' }}>
            {error?.message ?? 'Blog post not found'}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to="/blog" className="form-btn" style={{ display: 'inline-flex', width: 'auto' }}>
              <ion-icon name="arrow-back"></ion-icon>
              <span>Back to Blog</span>
            </Link>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main>
      <article className="blog active" style={{ maxWidth: 700, margin: '60px auto' }}>
        <header>
          <Link
            to="/blog"
            style={{ color: 'var(--orange-yellow-crayola)', fontSize: 'var(--fs-7)', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ion-icon name="arrow-back"></ion-icon>
            Back to Blog
          </Link>
          <h2 className="h2 article-title">{blog.title}</h2>
          <div className="blog-meta" style={{ marginTop: 10 }}>
            <p className="blog-category">{blog.tags[0] ?? 'Article'}</p>
            <span className="dot"></span>
            <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
          </div>
        </header>

        {blog.coverImage && (
          <figure className="blog-banner-box" style={{ marginTop: 20, marginBottom: 20, height: 'auto', borderRadius: 16, overflow: 'hidden' }}>
            <img
              src={blog.coverImage}
              alt={blog.title}
              style={{ width: '100%', display: 'block' }}
            />
          </figure>
        )}

        <Markdown content={blog.content} />
      </article>
    </main>
  );
}
