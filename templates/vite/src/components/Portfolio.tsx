import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PortfolioProject } from '../lib/api';

interface PortfolioProps {
  projects: PortfolioProject[];
  active: boolean;
}

export function Portfolio({ projects, active }: PortfolioProps) {
  const categories = ['all', ...new Set(projects.flatMap((p) => p.tags))];
  const [filter, setFilter] = useState('all');
  const [selectOpen, setSelectOpen] = useState(false);

  const filtered =
    filter === 'all'
      ? projects
      : projects.filter((p) => p.tags.includes(filter));

  return (
    <article
      className={`portfolio ${active ? 'active' : ''}`}
      data-page="portfolio"
    >
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        {/* Desktop filter buttons */}
        <ul className="filter-list">
          {categories.map((cat) => (
            <li key={cat} className="filter-item">
              <button
                className={filter === cat ? 'active' : ''}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile select */}
        <div className="filter-select-box">
          <button
            className={`filter-select ${selectOpen ? 'active' : ''}`}
            onClick={() => setSelectOpen((p) => !p)}
          >
            <div className="select-value">
              {filter === 'all' ? 'Select category' : filter}
            </div>
            <div className="select-icon">
              <ion-icon name="chevron-down"></ion-icon>
            </div>
          </button>

          <ul className="select-list">
            {categories.map((cat) => (
              <li key={cat} className="select-item">
                <button
                  onClick={() => {
                    setFilter(cat);
                    setSelectOpen(false);
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ul className="project-list">
          {filtered.map((project) => (
            <li key={project.id} className="project-item active">
              <Link to={`/project/${project.slug}`}>
                <figure className="project-img">
                  <div className="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>
                  <img
                    src={project.images[0] ?? project.logo ?? ''}
                    alt={project.title}
                    loading="lazy"
                  />
                </figure>

                <h3 className="project-title">{project.title}</h3>
                <p className="project-category">
                  {project.tags[0] ?? project.status}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
