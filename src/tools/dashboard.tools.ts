import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getDashboardSummary = tool(null, {
  name: "get_dashboard_summary",
  description:
    "Retrieves a comprehensive dashboard summary including sales metrics, inventory status, customer count, and outlet information for a specified date range",
  schema: z.object({
    start_date: z.string().describe("Start date in DD-MM-YYYY format"),
    end_date: z.string().describe("End date in DD-MM-YYYY format"),
  }),
});
