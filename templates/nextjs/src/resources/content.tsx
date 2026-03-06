import {
  About,
  Blog,
  Gallery,
  Home,
  Newsletter,
  Person,
  Social,
  Work,
} from '@/types';

/**
 * Static defaults — these are used by the header, footer, and layout
 * which import from @/resources synchronously.
 * Pages override these with real API data at render time.
 */
const person: Person = {
  firstName: '',
  lastName: '',
  name: 'Portfolio',
  role: '',
  avatar: '',
  email: '',
  location: 'America/New_York',
  languages: [],
};

const newsletter: Newsletter = {
  display: false,
  title: <>Newsletter</>,
  description: <>Subscribe for updates</>,
};

const social: Social = [];

const home: Home = {
  path: '/',
  image: '',
  label: 'Home',
  title: 'Portfolio',
  description: 'Portfolio website',
  headline: <>Welcome</>,
  featured: {
    display: false,
    title: <></>,
    href: '/work',
  },
  subline: <></>,
};

const about: About = {
  path: '/about',
  label: 'About',
  title: 'About',
  description: 'About me',
  tableOfContent: { display: true, subItems: false },
  avatar: { display: true },
  calendar: { display: false, link: '' },
  intro: { display: true, title: 'Introduction', description: <></> },
  work: { display: true, title: 'Work Experience', experiences: [] },
  studies: { display: true, title: 'Education', institutions: [] },
  technical: { display: true, title: 'Technical Skills', skills: [] },
};

const blog: Blog = {
  path: '/blog',
  label: 'Blog',
  title: 'Blog',
  description: 'Posts and articles',
};

const work: Work = {
  path: '/work',
  label: 'Work',
  title: 'Projects',
  description: 'My projects',
};

const gallery: Gallery = {
  path: '/gallery',
  label: 'Gallery',
  title: 'Gallery',
  description: 'Photo gallery',
  images: [],
};

export { person, social, newsletter, home, about, blog, work, gallery };
