/**
 * Mem0 Platform API Client
 * Implements core Mem0 REST API endpoints
 * https://docs.mem0.ai/api-reference
 */
import type { Mem0Config, AddMemoryResponse, Memory, FeedbackResponse } from './types.js';
export declare class Mem0Client {
    private apiKey;
    private orgId?;
    private projectId?;
    private baseUrl;
    constructor(config: Mem0Config);
    private request;
    /**
     * Add Memories (v2 recommended)
     * POST /v1/memories
     * https://docs.mem0.ai/api-reference/memory/add-memories
     */
    addMemories(params: {
        messages: Array<{
            role: string;
            content: string;
        }>;
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
    }): Promise<AddMemoryResponse[]>;
    /**
     * Search Memories (v2)
     * POST /v2/memories/search
     * https://docs.mem0.ai/api-reference/memory/v2-search-memories
     */
    searchMemories(params: {
        query: string;
        filters: Record<string, any>;
        version?: 'v2';
        top_k?: number;
        threshold?: number;
        rerank?: boolean;
        fields?: string[];
        org_id?: string;
        project_id?: string;
    }): Promise<Memory[]>;
    /**
     * Get Memories (v1 API - recommended for listing all memories)
     * GET /v1/memories
     * https://docs.mem0.ai/api-reference/memory/get-memories
     */
    getMemories(params: {
        user_id?: string;
        agent_id?: string;
        app_id?: string;
        run_id?: string;
        page?: number;
        page_size?: number;
        org_id?: string;
        project_id?: string;
    }): Promise<{
        results: Memory[];
        count: number;
    }>;
    /**
     * Get Single Memory
     * GET /v1/memories/{memory_id}
     * https://docs.mem0.ai/api-reference/memory/get-memory
     */
    getMemory(memoryId: string): Promise<Memory>;
    /**
     * Update Memory
     * PUT /v1/memories/{memory_id}
     * https://docs.mem0.ai/api-reference/memory/update-memory
     */
    updateMemory(params: {
        memory_id: string;
        text?: string;
        metadata?: Record<string, any>;
    }): Promise<Memory>;
    /**
     * Delete Memory
     * DELETE /v1/memories/{memory_id}
     * https://docs.mem0.ai/api-reference/memory/delete-memory
     */
    deleteMemory(memoryId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Submit Feedback
     * POST /v1/feedback
     * https://docs.mem0.ai/api-reference/memory/feedback
     */
    submitFeedback(params: {
        memory_id: string;
        feedback: 'POSITIVE' | 'NEGATIVE' | 'VERY_NEGATIVE';
        feedback_reason?: string;
        org_id?: string;
        project_id?: string;
    }): Promise<FeedbackResponse>;
    /**
     * Batch Update Memories
     * PUT /v1/batch/
     * https://docs.mem0.ai/api-reference/memory/batch-update
     */
    batchUpdateMemories(params: {
        memories: Array<{
            memory_id: string;
            text?: string;
            metadata?: Record<string, any>;
        }>;
    }): Promise<{
        message: string;
    }>;
    /**
     * Batch Delete Memories
     * DELETE /v1/batch/
     * https://docs.mem0.ai/api-reference/memory/batch-delete
     */
    batchDeleteMemories(params: {
        memory_ids: string[];
    }): Promise<{
        message: string;
    }>;
    /**
     * Delete Memories by Filter
     * DELETE /v1/memories
     * https://docs.mem0.ai/api-reference/memory/delete-memories
     */
    deleteMemoriesByFilter(params: {
        filters: Record<string, any>;
        org_id?: string;
        project_id?: string;
    }): Promise<{
        deleted_count: number;
    }>;
    /**
     * Create Memory Export
     * POST /v1/exports
     * https://docs.mem0.ai/api-reference/memory/create-memory-export
     */
    createMemoryExport(params: {
        filters: Record<string, any>;
        schema?: Record<string, any>;
        org_id?: string;
        project_id?: string;
    }): Promise<{
        message: string;
        id: string;
    }>;
    /**
     * Get Memory Export
     * POST /v1/exports/get
     * https://docs.mem0.ai/api-reference/memory/get-memory-export
     */
    getMemoryExport(exportId: string, params?: {
        org_id?: string;
        project_id?: string;
    }): Promise<{
        export_id: string;
        status: string;
        download_url?: string;
        created_at: string;
    }>;
    /**
     * Get Users
     * GET /v1/entities/
     * https://docs.mem0.ai/api-reference/entities/get-users
     */
    getUsers(params?: {
        org_id?: string;
        project_id?: string;
    }): Promise<Array<{
        id: string;
        name?: string;
        email?: string;
        type: string;
    }>>;
    /**
     * Delete User
     * DELETE /v1/entities/user/{user_id}/
     * https://docs.mem0.ai/api-reference/entities/delete-user
     */
    deleteUser(userId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=mem0-client.d.ts.map