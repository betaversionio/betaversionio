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
  lines.push(`\\usepackage[left=1in,right=1in,top=0.6in,bottom=0.6in]{geometry}`);
  lines.push(`\\usepackage{xcolor}`);
  lines.push(`\\usepackage{titlesec}`);
  lines.push(`\\usepackage{enumitem}`);
  lines.push(`\\usepackage[hidelinks]{hyperref}`);
  lines.push(`\\usepackage{parskip}`);
  lines.push(``);
  lines.push(`\\definecolor{accent}{HTML}{2563EB}`);
  lines.push(``);
  lines.push(`\\titleformat{\\section}{\\color{accent}\\large\\bfseries}{}{0em}{}[{\\color{accent}\\titlerule}]`);
  lines.push(`\\titlespacing{\\section}{0pt}{10pt}{5pt}`);
  lines.push(``);
  lines.push(`\\pagestyle{empty}`);
  lines.push(``);
  lines.push(`\\begin{document}`);
  lines.push(``);

  // Header with color accent
  lines.push(`\\begin{center}`);
  lines.push(`  {\\color{accent}\\LARGE\\bfseries ${e(data.name)}}\\\\`);
  lines.push(`  \\vspace{6pt}`);
  if (data.headline) {
    lines.push(`  {\\large\\itshape ${e(data.headline)}}\\\\`);
    lines.push(`  \\vspace{4pt}`);
  }
  const contactParts: string[] = [];
  if (data.email) contactParts.push(e(data.email));
  if (data.location) contactParts.push(e(data.location));
  if (data.website)
    contactParts.push(`\\href{${data.website}}{${e(data.website)}}`);
  for (const link of data.socialLinks.slice(0, 3)) {
    contactParts.push(`\\href{${link.url}}{${e(link.platform)}}`);
  }
  if (contactParts.length > 0) {
    lines.push(`  {\\small ${contactParts.join(" {\\textperiodcentered} ")}}`);
  }
  lines.push(`\\end{center}`);
  lines.push(``);

  // Bio
  if (data.bio) {
    lines.push(`\\section{About}`);
    lines.push(e(data.bio));
    lines.push(``);
  }

  // Experience
  if (data.experience.length > 0) {
    lines.push(`\\section{Experience}`);
    for (const exp of data.experience) {
      lines.push(
        `{\\bfseries ${e(exp.position)}} \\hfill {\\small ${formatDateRange(exp.startDate, exp.endDate, exp.current)}}\\\\`,
      );
      lines.push(
        `{\\color{accent}\\itshape ${e(exp.company)}}${exp.location ? ` |${e(exp.location)}` : ""}\\\\`,
      );
      if (exp.description) {
        lines.push(`{\\small ${e(exp.description)}}`);
      }
      lines.push(``);
    }
  }

  // Education
  if (data.education.length > 0) {
    lines.push(`\\section{Education}`);
    for (const edu of data.education) {
      lines.push(
        `{\\bfseries ${e(edu.degree)}${edu.fieldOfStudy ? ` in ${e(edu.fieldOfStudy)}` : ""}} \\hfill {\\small ${formatDateRange(edu.startDate, edu.endDate, edu.current)}}\\\\`,
      );
      lines.push(`{\\color{accent}\\itshape ${e(edu.institution)}}\\\\`);
      if (edu.description) {
        lines.push(`{\\small ${e(edu.description)}}`);
      }
      lines.push(``);
    }
  }

  // Skills
  if (data.skills.length > 0) {
    lines.push(`\\section{Skills}`);
    const groups = groupByCategory(data.skills);
    for (const [category, skills] of Object.entries(groups)) {
      lines.push(
        `{\\color{accent}\\bfseries ${e(category)}:} ${skills.map(e).join(", ")}\\\\`,
      );
    }
    lines.push(``);
  }

  // Projects
  if (data.projects.length > 0) {
    lines.push(`\\section{Projects}`);
    for (const proj of data.projects) {
      lines.push(
        `{\\bfseries ${e(proj.title)}}${proj.url ? ` \\hfill {\\small \\href{${proj.url}}{Link}}` : ""}\\\\`,
      );
      if (proj.tagline) {
        lines.push(`{\\color{accent}\\itshape ${e(proj.tagline)}}\\\\`);
      }
      if (proj.techStack.length > 0) {
        lines.push(`{\\small\\textit{${proj.techStack.map(e).join(", ")}}}\\\\`);
      }
      lines.push(``);
    }
  }

  // Services
  if (data.services.length > 0) {
    lines.push(`\\section{Services}`);
    lines.push(`\\begin{itemize}[leftmargin=*,itemsep=2pt]`);
    for (const svc of data.services) {
      lines.push(
        `  \\item {\\bfseries ${e(svc.title)}}${svc.description ? ` -- ${e(svc.description)}` : ""}`,
      );
    }
    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  lines.push(`\\end{document}`);

  return lines.join("\n");
}

export const modern: ResumeTemplateConfig = {
  id: "modern",
  name: "Modern",
  description: "Color-accented layout with social links and a contemporary design.",
  generate,
};
