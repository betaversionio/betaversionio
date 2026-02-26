import type { ResumeTemplateConfig, ResumeUserData } from "./types";
import {
  escapeLatex,
  formatDateRange,
  groupByCategory,
} from "./helpers";

function generate(data: ResumeUserData): string {
  const e = escapeLatex;
  const lines: string[] = [];

  lines.push(`\\documentclass[11pt,a4paper]{article}`);
  lines.push(`\\usepackage[margin=1in]{geometry}`);
  lines.push(`\\usepackage{titlesec}`);
  lines.push(`\\usepackage{enumitem}`);
  lines.push(`\\usepackage[hidelinks]{hyperref}`);
  lines.push(`\\usepackage{parskip}`);
  lines.push(``);
  lines.push(`\\titleformat{\\section}{\\Large\\bfseries\\scshape}{}{0em}{}[\\vspace{-4pt}\\rule{\\textwidth}{0.4pt}]`);
  lines.push(`\\titlespacing{\\section}{0pt}{14pt}{6pt}`);
  lines.push(`\\titleformat{\\subsection}{\\large\\bfseries}{}{0em}{}`);
  lines.push(`\\titlespacing{\\subsection}{0pt}{8pt}{4pt}`);
  lines.push(``);
  lines.push(`\\pagestyle{plain}`);
  lines.push(``);
  lines.push(`\\begin{document}`);
  lines.push(``);

  // Header
  lines.push(`\\begin{center}`);
  lines.push(`  {\\LARGE\\bfseries\\scshape ${e(data.name)}}\\\\`);
  lines.push(`  \\vspace{4pt}`);
  if (data.headline) {
    lines.push(`  {\\large ${e(data.headline)}}\\\\`);
    lines.push(`  \\vspace{3pt}`);
  }
  const contactParts: string[] = [];
  if (data.email) contactParts.push(e(data.email));
  if (data.location) contactParts.push(e(data.location));
  if (data.website)
    contactParts.push(`\\href{${data.website}}{${e(data.website)}}`);
  if (contactParts.length > 0) {
    lines.push(`  ${contactParts.join(" \\quad ")}`);
  }
  lines.push(`\\end{center}`);
  lines.push(``);

  // Research Interests / Bio
  if (data.bio) {
    lines.push(`\\section{Research Interests}`);
    lines.push(e(data.bio));
    lines.push(``);
  }

  // Education
  if (data.education.length > 0) {
    lines.push(`\\section{Education}`);
    for (const edu of data.education) {
      lines.push(
        `\\textbf{${e(edu.institution)}} \\hfill ${formatDateRange(edu.startDate, edu.endDate, edu.current)}\\\\`,
      );
      lines.push(
        `\\textit{${e(edu.degree)}${edu.fieldOfStudy ? ` in ${e(edu.fieldOfStudy)}` : ""}}\\\\`,
      );
      if (edu.description) {
        lines.push(e(edu.description));
      }
      lines.push(``);
    }
  }

  // Experience — framed as Academic / Professional
  if (data.experience.length > 0) {
    lines.push(`\\section{Professional Experience}`);
    for (const exp of data.experience) {
      lines.push(
        `\\textbf{${e(exp.position)}}, ${e(exp.company)} \\hfill ${formatDateRange(exp.startDate, exp.endDate, exp.current)}\\\\`,
      );
      if (exp.description) {
        lines.push(e(exp.description));
      }
      lines.push(``);
    }
  }

  // Skills / Technical Competencies
  if (data.skills.length > 0) {
    lines.push(`\\section{Technical Skills}`);
    const groups = groupByCategory(data.skills);
    lines.push(`\\begin{itemize}[leftmargin=*,itemsep=1pt]`);
    for (const [category, skills] of Object.entries(groups)) {
      lines.push(
        `  \\item \\textbf{${e(category)}:} ${skills.map(e).join(", ")}`,
      );
    }
    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  // Projects
  if (data.projects.length > 0) {
    lines.push(`\\section{Projects}`);
    lines.push(`\\begin{itemize}[leftmargin=*,itemsep=1pt]`);
    for (const proj of data.projects) {
      let entry = `  \\item \\textbf{${e(proj.title)}}`;
      if (proj.tagline) entry += ` -- ${e(proj.tagline)}`;
      if (proj.url) entry += ` (\\href{${proj.url}}{link})`;
      if (proj.techStack.length > 0) {
        entry += `. \\textit{${proj.techStack.map(e).join(", ")}}`;
      }
      lines.push(entry);
    }
    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  // Services / Other
  if (data.services.length > 0) {
    lines.push(`\\section{Service \\& Activities}`);
    lines.push(`\\begin{itemize}[leftmargin=*,itemsep=1pt]`);
    for (const svc of data.services) {
      lines.push(
        `  \\item \\textbf{${e(svc.title)}}${svc.description ? `: ${e(svc.description)}` : ""}`,
      );
    }
    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  lines.push(`\\end{document}`);

  return lines.join("\n");
}

export const academic: ResumeTemplateConfig = {
  id: "academic",
  name: "Academic",
  description: "Academic CV style with sections for research, education, and publications.",
  generate,
};
