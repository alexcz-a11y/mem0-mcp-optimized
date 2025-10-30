/**
 * Mem0 Platform API Client
 * Implements core Mem0 REST API endpoints
 * https://docs.mem0.ai/api-reference
 */

import type {
  Mem0Config,
  AddMemoryResponse,
  Memory,
  SearchMemoriesResponse,
  FeedbackResponse
} from './types.js';

export class Mem0Client {
  private apiKey: string;
  private orgId?: string;
  private projectId?: string;
  private baseUrl: string;

  constructor(config: Mem0Config) {
    this.apiKey = config.apiKey;
    this.orgId = config.orgId;
    this.projectId = config.projectId;
    this.baseUrl = config.baseUrl || 'https://api.mem0.ai';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Token ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Mem0 API Error (${response.status}): ${errorText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Add Memories (v2 recommended)
   * POST /v1/memories
   * https://docs.mem0.ai/api-reference/memory/add-memories
   */
  async addMemories(params: {
    messages: Array<{ role: string; content: string }>;
    user_id?: string;
    agent_id?: string;
    app_id?: string;
    run_id?: string;
    metadata?: Record<string, any>;
    enable_graph?: boolean;
    immutable?: boolean;
    expiration_date?: string;
    org_id?: string;
    project_id?: string;
    version?: 'v1' | 'v2';
  }): Promise<AddMemoryResponse[]> {
    const body = {
      ...params,
      org_id: params.org_id || this.orgId,
      project_id: params.project_id || this.projectId,
      version: params.version || 'v2'
    };

    return this.request<AddMemoryResponse[]>('/v1/memories/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Search Memories (v2)
   * POST /v2/memories/search
   * https://docs.mem0.ai/api-reference/memory/v2-search-memories
   */
  async searchMemories(params: {
    query: string;
    filters: Record<string, any>;
    version?: 'v2';
    top_k?: number;
    threshold?: number;
    rerank?: boolean;
    fields?: string[];
    org_id?: string;
    project_id?: string;
  }): Promise<Memory[]> {
    const body = {
      ...params,
      org_id: params.org_id || this.orgId,
      project_id: params.project_id || this.projectId,
      version: 'v2'
    };

    return this.request<Memory[]>('/v2/memories/search/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Get Memories (v2 - no query, just filters)
   * POST /v2/memories
   * https://docs.mem0.ai/api-reference/memory/v2-get-memories
   */
  async getMemories(params: {
    filters: Record<string, any>;
    page?: number;
    page_size?: number;
    fields?: string[];
    org_id?: string;
    project_id?: string;
  }): Promise<Memory[]> {
    const body = {
      ...params,
      org_id: params.org_id || this.orgId,
      project_id: params.project_id || this.projectId
    };

    return this.request<Memory[]>('/v2/memories/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Get Single Memory
   * GET /v1/memories/{memory_id}
   * https://docs.mem0.ai/api-reference/memory/get-memory
   */
  async getMemory(memoryId: string): Promise<Memory> {
    return this.request<Memory>(`/v1/memories/${memoryId}/`, {
      method: 'GET'
    });
  }

  /**
   * Update Memory
   * PUT /v1/memories/{memory_id}
   * https://docs.mem0.ai/api-reference/memory/update-memory
   */
  async updateMemory(params: {
    memory_id: string;
    text?: string;
    metadata?: Record<string, any>;
  }): Promise<Memory> {
    const { memory_id, ...body } = params;
    return this.request<Memory>(`/v1/memories/${memory_id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * Delete Memory
   * DELETE /v1/memories/{memory_id}
   * https://docs.mem0.ai/api-reference/memory/delete-memory
   */
  async deleteMemory(memoryId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/v1/memories/${memoryId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Submit Feedback
   * POST /v1/feedback
   * https://docs.mem0.ai/api-reference/memory/feedback
   */
  async submitFeedback(params: {
    memory_id: string;
    feedback: 'POSITIVE' | 'NEGATIVE' | 'VERY_NEGATIVE';
    feedback_reason?: string;
    org_id?: string;
    project_id?: string;
  }): Promise<FeedbackResponse> {
    const body = {
      ...params,
      org_id: params.org_id || this.orgId,
      project_id: params.project_id || this.projectId
    };
    return this.request<FeedbackResponse>('/v1/feedback/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Batch Update Memories
   * PUT /v1/batch/
   * https://docs.mem0.ai/api-reference/memory/batch-update
   */
  async batchUpdateMemories(params: {
    memories: Array<{
      memory_id: string;
      text?: string;
      metadata?: Record<string, any>;
    }>;
  }): Promise<{ message: string }> {
    return this.request('/v1/batch/', {
      method: 'PUT',
      body: JSON.stringify(params)
    });
  }

  /**
   * Batch Delete Memories
   * DELETE /v1/batch/
   * https://docs.mem0.ai/api-reference/memory/batch-delete
   */
  async batchDeleteMemories(params: {
    memory_ids: string[];
  }): Promise<{ message: string }> {
    const body = {
      memories: params.memory_ids.map(id => ({ memory_id: id }))
    };
    return this.request('/v1/batch/', {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  }

  /**
   * Delete Memories by Filter
   * DELETE /v1/memories
   * https://docs.mem0.ai/api-reference/memory/delete-memories
   */
  async deleteMemoriesByFilter(params: {
    filters: Record<string, any>;
    org_id?: string;
    project_id?: string;
  }): Promise<{ deleted_count: number }> {
    const body = {
      ...params,
      org_id: params.org_id || this.orgId,
      project_id: params.project_id || this.projectId
    };
    return this.request('/v1/memories/', {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  }

  /**
   * Create Memory Export
   * POST /v1/exports
   * https://docs.mem0.ai/api-reference/memory/create-memory-export
   */
  async createMemoryExport(params: {
    filters: Record<string, any>;
    schema?: Record<string, any>;
    org_id?: string;
    project_id?: string;
  }): Promise<{
    message: string;
    id: string;
  }> {
    const body = {
      schema: params.schema || {},
      filters: params.filters,
      org_id: params.org_id || this.orgId,
      project_id: params.project_id || this.projectId
    };
    return this.request('/v1/exports/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Get Memory Export
   * POST /v1/exports/get
   * https://docs.mem0.ai/api-reference/memory/get-memory-export
   */
  async getMemoryExport(exportId: string, params?: {
    org_id?: string;
    project_id?: string;
  }): Promise<{
    export_id: string;
    status: string;
    download_url?: string;
    created_at: string;
  }> {
    const body = {
      export_id: exportId,
      org_id: params?.org_id || this.orgId,
      project_id: params?.project_id || this.projectId
    };
    return this.request('/v1/exports/get/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Get Users
   * GET /v1/entities/
   * https://docs.mem0.ai/api-reference/entities/get-users
   */
  async getUsers(params?: {
    org_id?: string;
    project_id?: string;
  }): Promise<Array<{
    id: string;
    name?: string;
    email?: string;
    type: string;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.org_id || this.orgId) {
      queryParams.append('org_id', params?.org_id || this.orgId!);
    }
    if (params?.project_id || this.projectId) {
      queryParams.append('project_id', params?.project_id || this.projectId!);
    }
    const query = queryParams.toString();
    return this.request(`/v1/entities/${query ? `?${query}` : ''}`, {
      method: 'GET'
    });
  }

  /**
   * Delete User
   * DELETE /v1/entities/user/{user_id}/
   * https://docs.mem0.ai/api-reference/entities/delete-user
   */
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    return this.request(`/v1/entities/user/${userId}/`, {
      method: 'DELETE'
    });
  }
}
