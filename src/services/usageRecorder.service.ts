import { UsageService } from "./usage.service";
import { TokenPriceCalculatorService } from "./tokenPrice.service";

export type RecordUsageInput = {
  apiKeyId?: string;
  userId?: string;
  provider: string;
  model: string;
  type: string; // chat, image, etc.
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  currency?: string;
  metadata?: any;
};

export type RecordUsageResult = {
  usageId?: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
};

export class UsageRecorderService {
  private usageService: UsageService;
  private priceCalculator: TokenPriceCalculatorService;

  constructor(
    usageService = new UsageService(),
    priceCalculator = new TokenPriceCalculatorService()
  ) {
    this.usageService = usageService;
    this.priceCalculator = priceCalculator;
  }

  async record(input: RecordUsageInput): Promise<RecordUsageResult> {
    const model = input.model;
    const inputTokens = input.inputTokens ?? 0;
    const outputTokens = input.outputTokens ?? 0;

    const { inputCost, outputCost, totalCost, currency } =
      this.priceCalculator.calculate({
        model,
        inputTokens,
        outputTokens,
      });

    let usageId: string | undefined;
    if (input.apiKeyId) {
      const usage = await this.usageService.create({
        apiKeyId: input.apiKeyId,
        userId: input.userId as any,
        provider: input.provider,
        model: model,
        type: input.type,
        tokensIn: inputTokens,
        tokensOut: outputTokens,
        tokensTotal: input.totalTokens ?? inputTokens + outputTokens,
        cost: totalCost,
        currency: input.currency ?? currency,
        metadata: input.metadata,
      });
      usageId = usage.id;
    }

    return { usageId, inputCost, outputCost, totalCost, currency };
  }

  async recordFromRequest(
    req: any,
    usageMetadata: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
    },
    options?: {
      provider?: string;
      model?: string;
      type?: string;
      metadata?: any;
    }
  ): Promise<RecordUsageResult> {
    const provider = options?.provider ?? "openai";
    const model =
      options?.model ?? req?.body?.model ?? req?.model ?? "gpt-4o-mini";
    const type = options?.type ?? "chat";
    const inputTokens = usageMetadata?.input_tokens ?? 0;
    const outputTokens = usageMetadata?.output_tokens ?? 0;
    const totalTokens =
      usageMetadata?.total_tokens ?? inputTokens + outputTokens;

    return this.record({
      apiKeyId: req?.apiKey?.id,
      userId: req?.user?.id,
      provider,
      model,
      type,
      inputTokens,
      outputTokens,
      totalTokens,
      metadata: options?.metadata ?? { sessionId: req?.body?.sessionId },
    });
  }
}
