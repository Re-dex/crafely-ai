import Replicate from "replicate";
import { config } from "../config/env.config";
import { normalizeReplicateOutputs } from "../utils";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

type ReplicateModelIdentifier =
  | `${string}/${string}`
  | `${string}/${string}:${string}`;

interface GenerateImageParams {
  prompt: string;
  model?: string;
}

export class ReplicateService {
  private client: Replicate;
  private promptImprover: ChatOpenAI;

  constructor() {
    // Replicate SDK reads token from env if not provided.
    this.client = new Replicate({
      auth: config.replicate.apiToken,
    });
    this.promptImprover = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
    });
  }

  private async enhancePrompt(originalPrompt: string): Promise<string> {
    const messages = [
      new SystemMessage(
        "You are an expert prompt engineer for text-to-image models. Improve the user's prompt to be vivid, concrete, and concise; specify key subjects, composition, lighting, lens/camera settings, style, and render quality. Avoid changing the intent. Return only the improved prompt."
      ),
      new HumanMessage(
        `Original prompt: ${originalPrompt}\nImprove it for high-quality image generation.`
      ),
    ];

    const response: any = await this.promptImprover.invoke(messages as any);
    const improved =
      typeof response?.content === "string"
        ? (response.content as string)
        : Array.isArray(response?.content)
        ? response.content.map((c: any) => c?.text || "").join(" ")
        : originalPrompt;

    return improved?.trim() || originalPrompt;
  }

  async generateImage({
    prompt,
    model,
  }: GenerateImageParams): Promise<{ images: string | string[] }> {
    const modelId = (model ||
      config.replicate.defaultModel) as ReplicateModelIdentifier;

    const enhancedPrompt = await this.enhancePrompt(prompt);
    const result: any = await this.client.run(modelId, {
      input: { prompt: enhancedPrompt },
    });

    const images = await normalizeReplicateOutputs(result);
    return { images };
  }
}
