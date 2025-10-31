/**
 * Mem0 Platform API Client
 * Implements core Mem0 REST API endpoints
 * https://docs.mem0.ai/api-reference
 */
export class Mem0Client {
    apiKey;
    orgId;
    projectId;
    baseUrl;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.orgId = config.orgId;
        this.projectId = config.projectId;
        this.baseUrl = config.baseUrl || 'https://api.mem0.ai';
    }
    async request(endpoint, options = {}) {
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
            throw new Error(`Mem0 API Error (${response.status}): ${errorText}`);
        }
        return response.json();
    }
    /**
     * Add Memories (v2 recommended)
     * POST /v1/memories
     * https://docs.mem0.ai/api-reference/memory/add-memories
     */
    async addMemories(params) {
        const body = {
            ...params,
            org_id: params.org_id || this.orgId,
            project_id: params.project_id || this.projectId,
            version: params.version || 'v2'
        };
        const resp = await this.request('/v1/memories/', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (Array.isArray(resp))
            return resp;
        if (resp && Array.isArray(resp.results))
            return resp.results;
        return [];
    }
    /**
     * Search Memories (v2)
     * POST /v2/memories/search
     * https://docs.mem0.ai/api-reference/memory/v2-search-memories
     */
    async searchMemories(params) {
        const body = {
            ...params,
            org_id: params.org_id || this.orgId,
            project_id: params.project_id || this.projectId,
            version: 'v2'
        };
        return this.request('/v2/memories/search/', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
    /**
     * Get Memories (v1 API - recommended for listing all memories)
     * GET /v1/memories
     * https://docs.mem0.ai/api-reference/memory/get-memories
     */
    async getMemories(params) {
        const queryParams = new URLSearchParams();
        // Add entity identifiers
        if (params.user_id)
            queryParams.append('user_id', params.user_id);
        if (params.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params.app_id)
            queryParams.append('app_id', params.app_id);
        if (params.run_id)
            queryParams.append('run_id', params.run_id);
        // Add pagination
        if (params.page)
            queryParams.append('page', params.page.toString());
        if (params.page_size)
            queryParams.append('page_size', params.page_size.toString());
        // Add org/project
        if (params.org_id || this.orgId) {
            queryParams.append('org_id', params.org_id || this.orgId);
        }
        if (params.project_id || this.projectId) {
            queryParams.append('project_id', params.project_id || this.projectId);
        }
        const query = queryParams.toString();
        return this.request(`/v1/memories/${query ? `?${query}` : ''}`, {
            method: 'GET'
        });
    }
    /**
     * Get Single Memory
     * GET /v1/memories/{memory_id}
     * https://docs.mem0.ai/api-reference/memory/get-memory
     */
    async getMemory(memoryId) {
        return this.request(`/v1/memories/${memoryId}/`, {
            method: 'GET'
        });
    }
    /**
     * Update Memory
     * PUT /v1/memories/{memory_id}
     * https://docs.mem0.ai/api-reference/memory/update-memory
     */
    async updateMemory(params) {
        const { memory_id, ...body } = params;
        return this.request(`/v1/memories/${memory_id}/`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }
    /**
     * Delete Memory
     * DELETE /v1/memories/{memory_id}
     * https://docs.mem0.ai/api-reference/memory/delete-memory
     */
    async deleteMemory(memoryId) {
        return this.request(`/v1/memories/${memoryId}/`, {
            method: 'DELETE'
        });
    }
    /**
     * Submit Feedback
     * POST /v1/feedback
     * https://docs.mem0.ai/api-reference/memory/feedback
     */
    async submitFeedback(params) {
        const body = {
            ...params,
            org_id: params.org_id || this.orgId,
            project_id: params.project_id || this.projectId
        };
        return this.request('/v1/feedback/', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
    /**
     * Batch Update Memories
     * PUT /v1/batch/
     * https://docs.mem0.ai/api-reference/memory/batch-update
     */
    async batchUpdateMemories(params) {
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
    async batchDeleteMemories(params) {
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
    async deleteMemoriesByFilter(params) {
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
    async createMemoryExport(params) {
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
    async getMemoryExport(exportId, params) {
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
    async getUsers(params) {
        const queryParams = new URLSearchParams();
        if (params?.org_id || this.orgId) {
            queryParams.append('org_id', params?.org_id || this.orgId);
        }
        if (params?.project_id || this.projectId) {
            queryParams.append('project_id', params?.project_id || this.projectId);
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
    async deleteUser(userId) {
        return this.request(`/v1/entities/user/${userId}/`, {
            method: 'DELETE'
        });
    }
}
//# sourceMappingURL=mem0-client.js.map