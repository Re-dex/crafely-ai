export const DEFAULT_PRICE_MULTIPLIER = 5;
export const DEFAULT_MODEL_PRICING: PricingTable = {
  "gpt-4.1-mini": {
    inputPerMillion: 0.4,
    outputPerMillion: 1.6,
    currency: "usd",
  },
  "gpt-4o-mini": {
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
    currency: "usd",
  },
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10, currency: "usd" },
  // Add more models here when needed
};
type ModelPricing = {
  inputPerMillion: number; // price in currency per 1,000,000 input tokens
  outputPerMillion: number; // price in currency per 1,000,000 output tokens
  currency?: string; // default "usd"
};

type PricingTable = Record<string, ModelPricing>;

type CalculateArgs = {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
};

type CalculateResult = {
  model: string;
  currency: string;
  inputTokens: number;
  outputTokens: number;
  inputRatePerMillion: number;
  outputRatePerMillion: number;
  inputCost: number; // rounded to 6 decimals
  outputCost: number; // rounded to 6 decimals
  totalCost: number; // rounded to 6 decimals
};

export class TokenPriceCalculatorService {
  private pricingTable: PricingTable;
  private defaultCurrency: string;
  private priceMultiplier: number; // single multiplier for input & output costs

  constructor(
    defaultCurrency: string = "usd",
    priceMultiplier: number = DEFAULT_PRICE_MULTIPLIER
  ) {
    this.pricingTable = { ...DEFAULT_MODEL_PRICING };
    this.defaultCurrency = defaultCurrency;
    this.priceMultiplier = priceMultiplier;
  }

  setPricingTable(table: PricingTable) {
    this.pricingTable = { ...table };
  }

  setModelPricing(model: string, pricing: ModelPricing) {
    this.pricingTable[model] = pricing;
  }

  getModelPricing(model: string): ModelPricing | undefined {
    return this.pricingTable[model];
  }

  setPriceMultiplier(multiplier: number) {
    this.priceMultiplier =
      Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  }

  getPriceMultiplier(): number {
    return this.priceMultiplier;
  }

  calculate(args: CalculateArgs): CalculateResult {
    const modelPricing = this.getModelPricing(args.model);
    if (!modelPricing) {
      const error: any = new Error(
        `Pricing not found for model: ${args.model}`
      );
      error.status = 400;
      throw error;
    }

    const inputTokens = Math.max(0, Math.trunc(args.inputTokens ?? 0));
    const outputTokens = Math.max(0, Math.trunc(args.outputTokens ?? 0));

    const inputCostRaw = this.computeCostForTokens(
      inputTokens,
      modelPricing.inputPerMillion
    );
    const outputCostRaw = this.computeCostForTokens(
      outputTokens,
      modelPricing.outputPerMillion
    );

    const inputCost = this.round6(inputCostRaw * this.priceMultiplier);
    const outputCost = this.round6(outputCostRaw * this.priceMultiplier);
    const totalCost = this.round6(inputCost + outputCost);

    return {
      model: args.model,
      currency: modelPricing.currency ?? this.defaultCurrency,
      inputTokens,
      outputTokens,
      inputRatePerMillion: modelPricing.inputPerMillion,
      outputRatePerMillion: modelPricing.outputPerMillion,
      inputCost,
      outputCost,
      totalCost,
    };
  }

  computeCostForTokens(tokens: number, ratePerMillion: number): number {
    if (!Number.isFinite(tokens) || !Number.isFinite(ratePerMillion)) return 0;
    if (tokens <= 0 || ratePerMillion <= 0) return 0;
    const costPerToken = ratePerMillion / 1_000_000;
    return tokens * costPerToken;
  }

  private round6(value: number): number {
    return Number(
      (Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000).toFixed(6)
    );
  }
}

// Example usage:
// const calc = new TokenPriceCalculatorService({
//   "gpt-4.1-mini": { inputPerMillion: 0.40, outputPerMillion: 1.60, currency: "usd" },
// });
// const res = calc.calculate({ model: "gpt-4.1-mini", inputTokens: 1200, outputTokens: 300 });
// res.totalCost -> computed cost

// Static default pricing table (per million tokens)
