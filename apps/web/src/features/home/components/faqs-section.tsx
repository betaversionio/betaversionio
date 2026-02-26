import { DecorIcon } from '@/components/ui/decor-icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FaqsSection() {
  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 px-4 md:grid-cols-2 lg:border-x lg:px-0">
      <div className="px-4 pb-6 pt-12">
        <div className="space-y-5">
          <p className="text-[13px] font-medium uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl lg:font-black">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Quick answers to common questions about BetaVersion.IO. Open any
            question to learn more.
          </p>
          <p className="text-muted-foreground">
            {"Can't find what you're looking for? "}
            <a
              className="text-primary hover:underline"
              href="mailto:hello@betaversion.io"
            >
              Contact Us
            </a>
          </p>
        </div>
      </div>
      <div className="relative place-content-center">
        {/* vertical guide line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 h-full w-px bg-border"
        />

        <Accordion collapsible type="single">
          {faqs.map((item) => (
            <AccordionItem
              className="group relative border-b pl-5 first:border-t last:border-b"
              key={item.id}
              value={item.id}
            >
              <DecorIcon className="pointer-events-none absolute -bottom-[5.5px] left-[12.5px] size-2.5 -translate-x-1/2 text-muted-foreground group-last:hidden" />

              <AccordionTrigger className="px-4 py-4 text-[15px] leading-6 hover:no-underline">
                {item.title}
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 text-muted-foreground">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

const faqs = [
  {
    id: 'item-1',
    title: 'What is BetaVersion.IO?',
    content:
      'BetaVersion.IO is a developer identity platform that unifies your portfolio, resume, projects, feed, and ideas under a single subdomain (yourname.betaversion.io). Think of it as replacing your LinkedIn + GitHub profile + personal site + resume PDF with one living platform.',
  },
  {
    id: 'item-2',
    title: 'Is BetaVersion.IO free?',
    content:
      'Yes. BetaVersion.IO is free and open source. The free tier includes a full portfolio, project showcase, resume builder, feed, and idea board. We plan to offer a Pro tier for custom domains, premium templates, and advanced analytics.',
  },
  {
    id: 'item-3',
    title: 'How does the subdomain work?',
    content:
      'When you sign up and choose a username, you get yourname.betaversion.io as your permanent developer URL. It hosts your portfolio, projects, and a live resume PDF at /resume.pdf. You can also map a custom domain in the future.',
  },
  {
    id: 'item-4',
    title: 'Can I import my GitHub data?',
    content:
      'Yes. Sign in with GitHub and BetaVersion.IO automatically pulls your repos, languages, and contribution data. Your profile is pre-filled so you can have a complete developer identity in minutes.',
  },
  {
    id: 'item-5',
    title: 'What makes this different from LinkedIn or a portfolio site?',
    content:
      "BetaVersion.IO is built exclusively for developers. No recruiter spam, no buzzword bingo — just your actual work. It combines portfolio, resume, feed, and collaboration tools in one place, so you're known by what you build.",
  },
  {
    id: 'item-6',
    title: 'How does the resume builder work?',
    content:
      "Fill in structured sections (experience, education, skills, projects) through a clean form, pick a template, and BetaVersion.IO renders it into a polished ATS-friendly PDF. It's always live at yourname.betaversion.io/resume.pdf and auto-updates when you edit.",
  },
  {
    id: 'item-7',
    title: 'Can I collaborate with other developers?',
    content:
      "Absolutely. Tag collaborators on projects (they appear on everyone's profile), post ideas on the Idea Board to find teammates, and use the developer feed to share updates with the community.",
  },
];
