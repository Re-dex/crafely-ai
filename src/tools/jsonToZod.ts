import { z, ZodTypeAny } from "zod";

type JsonSchemaField = {
  type: string;
  description?: string;
};

type JsonSchema = Record<string, JsonSchemaField>;

const typeMap: Record<string, () => ZodTypeAny> = {
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  // You can extend this map:
  // date: () => z.string().refine(...),
  // array: () => z.array(...),
  // object: () => z.object(...),
};

export function convertToZodSchema(schema: JsonSchema) {
  const shape: Record<string, ZodTypeAny> = {};

  for (const [key, value] of Object.entries(schema)) {
    const zodBase = typeMap[value.type];
    if (!zodBase) {
      throw new Error(`Unsupported type: ${value.type}`);
    }

    let zodField = zodBase();
    if (value.description) {
      zodField = zodField.describe(value.description);
    }

    shape[key] = zodField;
  }

  return z.object(shape);
}
