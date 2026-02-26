import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn } from "child_process";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

interface CompileResult {
  pdf: Buffer;
  log: string;
  success: boolean;
  errors: string[];
}

@Injectable()
export class LatexService {
  private readonly logger = new Logger(LatexService.name);
  private readonly pdflatexPath: string;

  constructor(private readonly configService: ConfigService) {
    this.pdflatexPath =
      this.configService.get<string>("PDFLATEX_PATH") || "pdflatex";
  }

  async compile(source: string): Promise<CompileResult> {
    const tempDir = await mkdtemp(join(tmpdir(), "latex-"));
    const texFile = join(tempDir, "resume.tex");
    const pdfFile = join(tempDir, "resume.pdf");
    const logFile = join(tempDir, "resume.log");

    try {
      await writeFile(texFile, source, "utf-8");

      // Run pdflatex twice for cross-references
      for (let pass = 0; pass < 2; pass++) {
        const exitCode = await this.runPdflatex(tempDir, texFile);
        if (exitCode !== 0 && pass === 0) {
          // First pass failed — parse errors and return
          const log = await this.readFileOrEmpty(logFile);
          return {
            pdf: Buffer.alloc(0),
            log,
            success: false,
            errors: this.parseErrors(log),
          };
        }
      }

      const [pdf, log] = await Promise.all([
        readFile(pdfFile),
        this.readFileOrEmpty(logFile),
      ]);

      return { pdf, log, success: true, errors: [] };
    } catch (error) {
      this.logger.error("LaTeX compilation failed", error);
      const log = await this.readFileOrEmpty(logFile);
      return {
        pdf: Buffer.alloc(0),
        log,
        success: false,
        errors: [
          error instanceof Error ? error.message : "Unknown compilation error",
        ],
      };
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private runPdflatex(cwd: string, texFile: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const proc = spawn(
        this.pdflatexPath,
        [
          "-interaction=nonstopmode",
          "-halt-on-error",
          "--enable-installer",
          texFile,
        ],
        { cwd, timeout: 30_000 },
      );

      proc.on("close", (code) => resolve(code ?? 1));
      proc.on("error", (err) => {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          reject(
            new Error(
              `pdflatex not found at "${this.pdflatexPath}". Install TeX Live or MiKTeX.`,
            ),
          );
        } else {
          reject(err);
        }
      });
    });
  }

  private parseErrors(log: string): string[] {
    const errors: string[] = [];
    const lines = log.split("\n");

    for (const line of lines) {
      if (line.startsWith("!")) {
        errors.push(line.slice(2).trim());
      }
    }

    return errors.length > 0 ? errors : ["Compilation failed (check log)"];
  }

  private async readFileOrEmpty(path: string): Promise<string> {
    try {
      return await readFile(path, "utf-8");
    } catch {
      return "";
    }
  }
}
