import { z } from "zod";

export const productSchema = z
  .object({
    product: z
      .object({
        name: z
          .string()
          .describe(
            "The name of the product. It should be concise and descriptive."
          ),
        regular_price: z
          .number()
          .describe("The price of the product. It should be a number."),
        sale_price: z
          .number()
          .describe(
            "The sale price of the product. It should be different from the price. If there is no sale, it should be the same as the price."
          ),
        stock: z.number().describe("The stock of the product."),
        sku: z.string().describe("The SKU of the product."),
        categories: z
          .array(z.number())
          .describe(
            "The category ID of the product. You can get the category IDs from the category List in context area."
          ),
        tags: z
          .array(z.number())
          .describe(
            "The tags ID of the product. You can get the tag IDs from the tags List in context area."
          )
          .optional(),
        status: z
          .enum(["publish", "draft", "pending", "private"])
          .describe("The status of the product."),
        short_description: z
          .string()
          .describe(
            "A short description of the product. It should be key highlighted and concise."
          ),
        description: z
          .string()
          .describe(
            "A detailed description of the product. It should be formatted in HTML."
          ),
      })
      .strict(),
  })
  .strict();
