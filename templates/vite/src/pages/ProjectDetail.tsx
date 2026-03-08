import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { client, type PortfolioProject } from '../lib/api';
import { Markdown } from '../components/Markdown';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    client
      .getProject(slug)
      .then((result) => {
        if (result) setProject(result);
        else setError('Project not found');
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main>
        <article className="portfolio active" style={{ maxWidth: 700, margin: '60px auto' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--light-gray)' }}>
            Loading...
          </div>
        </article>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main>
        <article className="portfolio active" style={{ maxWidth: 700, margin: '60px auto' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--bittersweet-shimmer)' }}>
            {error ?? 'Project not found'}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to="/portfolio" className="form-btn" style={{ display: 'inline-flex', width: 'auto' }}>
              <ion-icon name="arrow-back"></ion-icon>
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main>
      <article className="portfolio active" style={{ maxWidth: 700, margin: '60px auto' }}>
        <header>
          <Link
            to="/portfolio"
            style={{ color: 'var(--orange-yellow-crayola)', fontSize: 'var(--fs-7)', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ion-icon name="arrow-back"></ion-icon>
            Back to Portfolio
          </Link>
          <h2 className="h2 article-title">{project.title}</h2>
          {project.tagline && (
            <p style={{ color: 'var(--light-gray)', fontSize: 'var(--fs-6)', marginTop: 5 }}>
              {project.tagline}
            </p>
          )}
        </header>

        {/* Images gallery */}
        {project.images.length > 0 && (
          <figure style={{ marginTop: 20, marginBottom: 20, borderRadius: 16, overflow: 'hidden' }}>
            <img
              src={project.images[0]}
              alt={project.title}
              style={{ width: '100%', display: 'block', borderRadius: 16 }}
            />
          </figure>
        )}

        {/* Meta info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {project.status && (
            <span className="info-content title" style={{ background: 'var(--onyx)', color: 'var(--white-1)', padding: '3px 12px', borderRadius: 8, fontSize: 'var(--fs-8)' }}>
              {project.status}
            </span>
          )}
          {project.launchDate && (
            <span style={{ color: 'var(--light-gray-70)', fontSize: 'var(--fs-7)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ion-icon name="calendar-outline"></ion-icon>
              {formatDate(project.launchDate)}
            </span>
          )}
        </div>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 className="h4" style={{ marginBottom: 10 }}>Tech Stack</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  style={{ background: 'var(--onyx)', color: 'var(--white-2)', padding: '4px 12px', borderRadius: 8, fontSize: 'var(--fs-8)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <Markdown content={project.description} />

        {/* Links */}
        {(project.demoUrl || project.links.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="form-btn"
                style={{ display: 'inline-flex', width: 'auto' }}
              >
                <ion-icon name="open-outline"></ion-icon>
                <span>Live Demo</span>
              </a>
            )}
            {project.links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="form-btn"
                style={{ display: 'inline-flex', width: 'auto' }}
              >
                <ion-icon name="link-outline"></ion-icon>
                <span>Link</span>
              </a>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
