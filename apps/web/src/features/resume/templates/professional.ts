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
  lines.push(`\\usepackage[margin=0.75in]{geometry}`);
  lines.push(`\\usepackage{titlesec}`);
  lines.push(`\\usepackage{enumitem}`);
  lines.push(`\\usepackage[hidelinks]{hyperref}`);
  lines.push(`\\usepackage{parskip}`);
  lines.push(``);
  lines.push(`\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]`);
  lines.push(`\\titlespacing{\\section}{0pt}{12pt}{6pt}`);
  lines.push(``);
  lines.push(`\\pagestyle{empty}`);
  lines.push(``);
  lines.push(`\\begin{document}`);
  lines.push(``);

  // Header
  lines.push(`\\begin{center}`);
  lines.push(`  {\\LARGE\\bfseries ${e(data.name)}}\\\\`);
  lines.push(`  \\vspace{4pt}`);
  const contactParts: string[] = [];
  if (data.email) contactParts.push(e(data.email));
  if (data.location) contactParts.push(e(data.location));
  if (data.website)
    contactParts.push(`\\href{${data.website}}{${e(data.website)}}`);
  if (contactParts.length > 0) {
    lines.push(`  ${contactParts.join(" | ")}`)
  }
  lines.push(`\\end{center}`);
  lines.push(``);

  // Summary
  if (data.headline || data.bio) {
    lines.push(`\\section{Summary}`);
    if (data.headline) lines.push(e(data.headline));
    if (data.bio) lines.push(e(data.bio));
    lines.push(``);
  }

  // Experience
  if (data.experience.length > 0) {
    lines.push(`\\section{Experience}`);
    for (const exp of data.experience) {
      lines.push(
        `\\textbf{${e(exp.position)}} \\hfill ${formatDateRange(exp.startDate, exp.endDate, exp.current)}\\\\`,
      );
      lines.push(
        `\\textit{${e(exp.company)}}${exp.location ? ` -- ${e(exp.location)}` : ""}\\\\`,
      );
      if (exp.description) {
        lines.push(e(exp.description));
      }
      lines.push(``);
    }
  }

  // Education
  if (data.education.length > 0) {
    lines.push(`\\section{Education}`);
    for (const edu of data.education) {
      lines.push(
        `\\textbf{${e(edu.degree)}${edu.fieldOfStudy ? ` in ${e(edu.fieldOfStudy)}` : ""}} \\hfill ${formatDateRange(edu.startDate, edu.endDate, edu.current)}\\\\`,
      );
      lines.push(`\\textit{${e(edu.institution)}}\\\\`);
      if (edu.description) {
        lines.push(e(edu.description));
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
        `\\textbf{${e(category)}:} ${skills.map(e).join(", ")}\\\\`,
      );
    }
    lines.push(``);
  }

  // Projects
  if (data.projects.length > 0) {
    lines.push(`\\section{Projects}`);
    for (const proj of data.projects) {
      lines.push(
        `\\textbf{${e(proj.title)}}${proj.url ? ` \\hfill \\href{${proj.url}}{Link}` : ""}\\\\`,
      );
      if (proj.tagline) {
        lines.push(`\\textit{${e(proj.tagline)}}\\\\`);
      }
      if (proj.techStack.length > 0) {
        lines.push(`\\textit{Tech: ${proj.techStack.map(e).join(", ")}}\\\\`);
      }
      lines.push(``);
    }
  }

  // Services
  if (data.services.length > 0) {
    lines.push(`\\section{Services}`);
    lines.push(`\\begin{itemize}[leftmargin=*]`);
    for (const svc of data.services) {
      lines.push(
        `  \\item \\textbf{${e(svc.title)}}${svc.description ? ` -- ${e(svc.description)}` : ""}`,
      );
    }
    lines.push(`\\end{itemize}`);
    lines.push(``);
  }

  lines.push(`\\end{document}`);

  return lines.join("\n");
}

export const professional: ResumeTemplateConfig = {
  id: "professional",
  name: "Professional",
  description: "Classic single-column layout with clean sections and a professional feel.",
  generate,
};
