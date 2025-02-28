import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config/env.config';
import { ChatCompletionRequest, StreamResponse } from '../types';

export class ChatService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
      streaming: true,
    });
  }

  async streamChat(request: ChatCompletionRequest) {
    const { messages } = request;

    const stream = await this.model.stream(messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })));

    return stream;
  }

  async chat(request: ChatCompletionRequest) {
    const { messages } = request;

    const response = await this.model.invoke(messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })));

    return response;
  }
}