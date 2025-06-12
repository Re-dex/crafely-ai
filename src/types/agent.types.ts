export interface CreateAgentDTO {
  name: string;
  instructions: string;
  tools: string; // JSON stringified array
  context?: string;
  userId: string;
}

export interface UpdateAgentDTO extends Partial<CreateAgentDTO> {
  id: string;
}

export interface AgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId: string;
}
