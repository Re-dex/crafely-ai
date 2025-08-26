import Replicate from "replicate";
import { config } from "../config/env.config";
import { normalizeReplicateOutputs } from "../utils";

type ReplicateModelIdentifier =
  | `${string}/${string}`
  | `${string}/${string}:${string}`;

interface GenerateImageParams {
  prompt: string;
  model?: string;
}

export class ReplicateService {
  private client: Replicate;

  constructor() {
    // Replicate SDK reads token from env if not provided.
    this.client = new Replicate({
      auth: config.replicate.apiToken,
    });
  }

  async generateImage({
    prompt,
    model,
  }: GenerateImageParams): Promise<{ images: string | string[] }> {
    const modelId = (model ||
      config.replicate.defaultModel) as ReplicateModelIdentifier;
    const result: any = await this.client.run(modelId, {
      input: { prompt },
    });

    const images = await normalizeReplicateOutputs(result);
    return { images };
  }
}
