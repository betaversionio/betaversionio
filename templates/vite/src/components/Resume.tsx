import type { PortfolioUser } from '@betaversionio/portfolio-sdk';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

interface ResumeProps {
  user: PortfolioUser;
  active: boolean;
}

export function Resume({ user, active }: ResumeProps) {
  return (
    <article className={`resume ${active ? 'active' : ''}`} data-page="resume">
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      {user.education.length > 0 && (
        <section className="timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <ion-icon name="book-outline"></ion-icon>
            </div>
            <h3 className="h3">Education</h3>
          </div>

          <ol className="timeline-list">
            {user.education.map((edu) => (
              <li key={edu.id} className="timeline-item">
                <h4 className="h4 timeline-item-title">{edu.institution}</h4>
                <span>
                  {formatDate(edu.startDate)} —{' '}
                  {edu.current ? 'Present' : edu.endDate ? formatDate(edu.endDate) : ''}
                </span>
                <p className="timeline-text">
                  {edu.degree}
                  {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </p>
                {edu.description && (
                  <p className="timeline-text">{edu.description}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {user.experiences.length > 0 && (
        <section className="timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <ion-icon name="briefcase-outline"></ion-icon>
            </div>
            <h3 className="h3">Experience</h3>
          </div>

          <ol className="timeline-list">
            {user.experiences.map((exp) => (
              <li key={exp.id} className="timeline-item">
                <h4 className="h4 timeline-item-title">
                  {exp.position} at {exp.company}
                </h4>
                <span>
                  {formatDate(exp.startDate)} —{' '}
                  {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                </span>
                {exp.description && (
                  <p className="timeline-text">{exp.description}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {user.techStack.length > 0 && (
        <section className="skill">
          <h3 className="h3 skills-title">Skills</h3>
          <ul className="skills-list content-card">
            {user.techStack.map((tech, i) => {
              const pct =
                tech.proficiency === 'Expert'
                  ? 95
                  : tech.proficiency === 'Advanced'
                    ? 80
                    : tech.proficiency === 'Intermediate'
                      ? 60
                      : 35;
              return (
                <li key={i} className="skills-item">
                  <div className="title-wrapper">
                    <h5 className="h5">{tech.name}</h5>
                    <data value={pct}>{pct}%</data>
                  </div>
                  <div className="skill-progress-bg">
                    <div
                      className="skill-progress-fill"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
