import type { PortfolioUser } from '../lib/api';

interface AboutProps {
  user: PortfolioUser;
  active: boolean;
}

export function About({ user, active }: AboutProps) {
  return (
    <article className={`about ${active ? 'active' : ''}`} data-page="about">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      {user.profile?.bio && (
        <section className="about-text">
          {user.profile.bio.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}

      {user.services.length > 0 && (
        <section className="service">
          <h3 className="h3 service-title">What I'm Doing</h3>
          <ul className="service-list">
            {user.services.map((service) => (
              <li key={service.id} className="service-item">
                <div className="service-icon-box">
                  <ion-icon name="code-slash-outline" style={{ fontSize: '40px' }}></ion-icon>
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">{service.title}</h4>
                  {service.description && (
                    <p className="service-item-text">{service.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.techStack.length > 0 && (
        <section className="skill">
          <h3 className="h3 skills-title">Tech Stack</h3>
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
