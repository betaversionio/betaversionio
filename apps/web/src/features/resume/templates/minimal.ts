import type { ResumeTemplateConfig, ResumeUserData } from "./types";
import {
  escapeLatex,
  formatDateRange,
} from "./helpers";

function generate(data: ResumeUserData): string {
  const e = escapeLatex;
  const lines: string[] = [];

  lines.push(`\\documentclass[10pt,a4paper]{article}`);
  lines.push(`\\usepackage[margin=0.5in]{geometry}`);
  lines.push(`\\usepackage[hidelinks]{hyperref}`);
  lines.push(`\\usepackage{parskip}`);
  lines.push(`\\usepackage{enumitem}`);
  lines.push(``);
  lines.push(`\\setlength{\\parindent}{0pt}`);
  lines.push(`\\pagestyle{empty}`);
  lines.push(``);
  lines.push(`\\newcommand{\\ressection}[1]{\\vspace{6pt}{\\bfseries\\uppercase{#1}}\\vspace{2pt}\\hrule\\vspace{4pt}}`);
  lines.push(``);
  lines.push(`\\begin{document}`);
  lines.push(``);

  // Header — compact
  lines.push(`{\\Large\\bfseries ${e(data.name)}}\\hfill`);
  const contactParts: string[] = [];
  if (data.email) contactParts.push(e(data.email));
  if (data.location) contactParts.push(e(data.location));
  if (data.website)
    contactParts.push(`\\href{${data.website}}{${e(data.website)}}`);
  if (contactParts.length > 0) {
    lines.push(`{\\small ${contactParts.join(" | ")}}`);
  }
  lines.push(``);

  // Experience
  if (data.experience.length > 0) {
    lines.push(`\\ressection{Experience}`);
    for (const exp of data.experience) {
      lines.push(
        `\\textbf{${e(exp.position)}}, ${e(exp.company)}${exp.location ? `, ${e(exp.location)}` : ""} \\hfill {\\small ${formatDateRange(exp.startDate, exp.endDate, exp.current)}}\\\\`,
      );
      if (exp.description) {
        lines.push(`{\\small ${e(exp.description)}}\\\\`);
      }
    }
    lines.push(``);
  }

  // Education
  if (data.education.length > 0) {
    lines.push(`\\ressection{Education}`);
    for (const edu of data.education) {
      lines.push(
        `\\textbf{${e(edu.degree)}}${edu.fieldOfStudy ? `, ${e(edu.fieldOfStudy)}` : ""}, ${e(edu.institution)} \\hfill {\\small ${formatDateRange(edu.startDate, edu.endDate, edu.current)}}\\\\`,
      );
    }
    lines.push(``);
  }

  // Skills — single line
  if (data.skills.length > 0) {
    lines.push(`\\ressection{Skills}`);
    lines.push(data.skills.map((s) => e(s.name)).join(", "));
    lines.push(``);
  }

  // Projects
  if (data.projects.length > 0) {
    lines.push(`\\ressection{Projects}`);
    for (const proj of data.projects) {
      lines.push(
        `\\textbf{${e(proj.title)}}${proj.tagline ? ` -- ${e(proj.tagline)}` : ""}${proj.url ? ` \\hfill {\\small \\href{${proj.url}}{Link}}` : ""}\\\\`,
      );
    }
    lines.push(``);
  }

  lines.push(`\\end{document}`);

  return lines.join("\n");
}

export const minimal: ResumeTemplateConfig = {
  id: "minimal",
  name: "Minimal",
  description: "Ultra-compact one-page layout with tight margins for maximum content.",
  generate,
};
