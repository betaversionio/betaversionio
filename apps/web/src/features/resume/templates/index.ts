export type { ResumeUserData, ResumeTemplateConfig } from "./types";
export { escapeLatex, formatDate, formatDateRange, groupByCategory } from "./helpers";

import { professional } from "./professional";
import { modern } from "./modern";
import { minimal } from "./minimal";
import { academic } from "./academic";

export const RESUME_TEMPLATES = [professional, modern, minimal, academic];
