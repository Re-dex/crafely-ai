import { tool } from "@langchain/core/tools";
import { convertToZodSchema } from "./jsonToZod";

export const toolWrapper = (toolsSchema = []) => {
  if (!toolsSchema.length) {
    return [];
  }
  return toolsSchema.map((item) => {
    return tool(null, {
      name: item.name,
      description: item.description,
      schema: convertToZodSchema(item.args),
    });
  });
};
