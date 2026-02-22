import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { z } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return result.data;
  }
}
