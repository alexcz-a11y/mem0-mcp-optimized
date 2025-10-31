#!/usr/bin/env node
/**
 * Mem0 MCP Server
 * Model Context Protocol server for Mem0 Platform
 *
 * Provides AI agents with enterprise-grade memory management capabilities:
 * - Add conversational memories with metadata & graph support
 * - Semantic search with advanced filters
 * - Memory CRUD operations
 * - Feedback collection
 *
 * Usage:
 *   MEM0_API_KEY=your_key node dist/index.js
 *   MEM0_API_KEY=your_key MEM0_ORG_ID=org_id MEM0_PROJECT_ID=proj_id node dist/index.js
 *
 * Based on: https://docs.mem0.ai/api-reference
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { Mem0Client } from './mem0-client.js';
import { AddMemoriesInputCoreSchema, AddMemoriesInputSchema, SearchMemoriesInputSchema, GetMemoriesInputSchema, UpdateMemoryInputSchema, DeleteMemoryInputSchema, FeedbackInputSchema, GetMemoryInputSchema, BatchUpdateMemoriesInputSchema, BatchDeleteMemoriesInputSchema, DeleteMemoriesByFilterInputSchema, CreateMemoryExportInputSchema, GetMemoryExportInputSchema, GetUsersInputSchema, DeleteUserInputSchema } from './types.js';
// ============================================================================
// Configuration Schema (Optional - for Smithery session config)
// ============================================================================
// Export configuration schema for Smithery
// apiKey and defaultUserId are required for proper operation
export const configSchema = z.object({
    apiKey: z.string().describe("Mem0 Platform API key (required). Get yours at https://app.mem0.ai/dashboard/api-keys"),
    defaultUserId: z.string().describe("Default user ID for memory scoping (required). All memories will be associated with this user unless the AI explicitly provides a different user_id. Example: 'user_123' or your email"),
    orgId: z.string().optional().describe("Mem0 organization ID (optional, defaults to MEM0_ORG_ID env var)"),
    projectId: z.string().optional().describe("Mem0 project ID (optional, defaults to MEM0_PROJECT_ID env var)"),
    baseUrl: z.string().optional().default("https://api.mem0.ai").describe("Mem0 API base URL (optional, defaults to https://api.mem0.ai)")
});
// ============================================================================
// Configuration
// =============================================================================
let mem0;
let lastConfig = null;
function ensureMem0() {
    if (!mem0) {
        const c = lastConfig ?? {
            apiKey: process.env.MEM0_API_KEY,
            defaultUserId: process.env.MEM0_DEFAULT_USER_ID,
            orgId: process.env.MEM0_ORG_ID,
            projectId: process.env.MEM0_PROJECT_ID,
            baseUrl: process.env.MEM0_BASE_URL
        };
        if (!c.apiKey) {
            throw new Error('Mem0 API key required. Set MEM0_API_KEY environment variable or provide apiKey in session config. Get your API key at https://app.mem0.ai');
        }
        mem0 = new Mem0Client(c);
    }
    return mem0;
}
// Helper: Check if a user_id is a placeholder/generic value that should be replaced
function isPlaceholderUserId(userId) {
    if (!userId)
        return true;
    const placeholders = [
        'user',
        'your_user_id',
        'user_id',
        'userid',
        'default',
        'test',
        'example',
        'placeholder'
    ];
    const normalized = userId.toLowerCase().trim();
    return placeholders.includes(normalized);
}
// Helper: Get the default user ID from config or env
function getDefaultUserId() {
    return lastConfig?.defaultUserId || process.env.MEM0_DEFAULT_USER_ID;
}
// Helper: Auto-inject org_id and project_id from config if not provided by AI
// Only inject if the values are explicitly configured (non-empty)
function injectOrgProjectIds(params) {
    // Auto-inject org_id if not provided AND if configured
    if (!params.org_id) {
        const orgId = lastConfig?.orgId || process.env.MEM0_ORG_ID;
        // Only inject if orgId is truthy and not empty string
        if (orgId && orgId.trim().length > 0) {
            params.org_id = orgId;
        }
    }
    // Auto-inject project_id if not provided AND if configured
    if (!params.project_id) {
        const projectId = lastConfig?.projectId || process.env.MEM0_PROJECT_ID;
        // Only inject if projectId is truthy and not empty string
        if (projectId && projectId.trim().length > 0) {
            params.project_id = projectId;
        }
    }
}
// Helper: Check if filters contain any owner identifier
function hasOwnerIdentifier(filters) {
    if (!filters || typeof filters !== 'object')
        return false;
    return !!(filters.user_id || filters.agent_id || filters.app_id || filters.run_id);
}
function formatZodError(err) {
    if (err && err.name === 'ZodError' && Array.isArray(err.issues)) {
        const issues = err.issues.map((i) => ({ path: i.path, message: i.message, code: i.code }));
        return `Invalid arguments: ${JSON.stringify(issues)}`;
    }
    return err instanceof Error ? err.message : String(err);
}
function parseMaybeJsonObject(val) {
    if (typeof val === 'string') {
        try {
            const o = JSON.parse(val);
            if (o && typeof o === 'object')
                return o;
        }
        catch { }
    }
    return val;
}
function normalizeMessagesVal(messages) {
    if (typeof messages === 'string')
        return [{ role: 'user', content: messages }];
    if (Array.isArray(messages))
        return messages.map((m) => (typeof m === 'string' ? { role: 'user', content: m } : m));
    if (messages && typeof messages === 'object' && 'content' in messages)
        return [messages];
    return messages;
}
// ============================================================================
// MCP Server Setup
// ============================================================================
const server = new McpServer({
    name: 'mem0-mcp-server',
    version: '1.0.0'
});
// ============================================================================
// Tool: add_memories
// ============================================================================
server.registerTool('add_memories', {
    title: 'Add Memories',
    description: 'Store new memories from conversations. Supports v2 API with graph memory, metadata, and entity tracking. Returns memory IDs and extracted content.',
    inputSchema: {
        messages: AddMemoriesInputCoreSchema.shape.messages,
        user_id: AddMemoriesInputCoreSchema.shape.user_id,
        agent_id: AddMemoriesInputCoreSchema.shape.agent_id,
        app_id: AddMemoriesInputCoreSchema.shape.app_id,
        run_id: AddMemoriesInputCoreSchema.shape.run_id,
        metadata: AddMemoriesInputCoreSchema.shape.metadata,
        enable_graph: AddMemoriesInputCoreSchema.shape.enable_graph,
        immutable: AddMemoriesInputCoreSchema.shape.immutable,
        expiration_date: AddMemoriesInputCoreSchema.shape.expiration_date,
        org_id: AddMemoriesInputCoreSchema.shape.org_id,
        project_id: AddMemoriesInputCoreSchema.shape.project_id,
        version: AddMemoriesInputCoreSchema.shape.version
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false
    }
}, async (params) => {
    try {
        ensureMem0();
        const p = { ...params };
        p.messages = normalizeMessagesVal(p.messages);
        // Smart user_id handling:
        // 1. If AI provided a placeholder value (like "user"), replace it with defaultUserId
        // 2. If no owner identifier provided at all, inject defaultUserId
        // 3. If AI provided a specific value (like "alice"), keep it
        if (isPlaceholderUserId(p.user_id)) {
            const defaultUserId = getDefaultUserId();
            if (defaultUserId) {
                p.user_id = defaultUserId;
            }
        }
        // Fallback: if still no owner identifier, try to inject defaultUserId
        if (!p.user_id && !p.agent_id && !p.app_id && !p.run_id) {
            const defaultUserId = getDefaultUserId();
            if (defaultUserId) {
                p.user_id = defaultUserId;
            }
        }
        // Auto-inject org_id and project_id from config
        injectOrgProjectIds(p);
        const validated = AddMemoriesInputSchema.parse(p);
        const results = await mem0.addMemories(validated);
        const output = {
            results: results.map(r => ({
                id: r.id,
                memory: r.data.memory,
                event: r.event
            })),
            count: results.length
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error adding memories: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: search_memories
// ============================================================================
server.registerTool('search_memories', {
    title: 'Search Memories',
    description: 'Semantic search across memories with advanced filters (AND/OR/NOT, in/gte/lte/contains). Supports categories, metadata, timestamps, and entity IDs. Use for contextual retrieval.',
    inputSchema: {
        query: SearchMemoriesInputSchema.shape.query,
        filters: SearchMemoriesInputSchema.shape.filters,
        top_k: SearchMemoriesInputSchema.shape.top_k,
        threshold: SearchMemoriesInputSchema.shape.threshold,
        rerank: SearchMemoriesInputSchema.shape.rerank,
        fields: SearchMemoriesInputSchema.shape.fields,
        org_id: SearchMemoriesInputSchema.shape.org_id,
        project_id: SearchMemoriesInputSchema.shape.project_id
    },
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const p = { ...params };
        p.filters = parseMaybeJsonObject(p.filters);
        // Smart filters handling:
        // 1. If filters are empty, inject defaultUserId
        // 2. If filters contain a placeholder user_id (like "user"), replace it
        const defaultUserId = getDefaultUserId();
        if (p.filters && Object.keys(p.filters).length === 0) {
            if (defaultUserId) {
                p.filters = { user_id: defaultUserId };
            }
        }
        else if (p.filters?.user_id && isPlaceholderUserId(p.filters.user_id)) {
            if (defaultUserId) {
                p.filters.user_id = defaultUserId;
            }
        }
        // Note: NOT injecting org_id/project_id for search to allow broader queries
        // Let Mem0 API handle scope based on API key
        const validated = SearchMemoriesInputSchema.parse(p);
        const memories = await mem0.searchMemories(validated);
        const output = {
            memories,
            count: memories.length,
            query: validated.query
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error searching memories: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: get_memories
// ============================================================================
server.registerTool('get_memories', {
    title: 'Get Memories',
    description: 'List all memories with pagination. Provide at least one of: user_id, agent_id, app_id, or run_id. Defaults to defaultUserId if none provided.',
    inputSchema: {
        user_id: GetMemoriesInputSchema.shape.user_id,
        agent_id: GetMemoriesInputSchema.shape.agent_id,
        app_id: GetMemoriesInputSchema.shape.app_id,
        run_id: GetMemoriesInputSchema.shape.run_id,
        page: GetMemoriesInputSchema.shape.page,
        page_size: GetMemoriesInputSchema.shape.page_size,
        org_id: GetMemoriesInputSchema.shape.org_id,
        project_id: GetMemoriesInputSchema.shape.project_id
    },
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const p = { ...params };
        // Smart user_id handling
        const defaultUserId = getDefaultUserId();
        // If no entity ID provided, inject defaultUserId
        if (!p.user_id && !p.agent_id && !p.app_id && !p.run_id) {
            if (defaultUserId) {
                p.user_id = defaultUserId;
            }
        }
        // Replace placeholder user_id
        if (p.user_id && isPlaceholderUserId(p.user_id)) {
            if (defaultUserId) {
                p.user_id = defaultUserId;
            }
            else {
                delete p.user_id; // Remove placeholder if no default
            }
        }
        // Note: NOT injecting org_id/project_id for get to allow broader queries
        // Let Mem0 API handle scope based on API key
        const validated = GetMemoriesInputSchema.parse(p);
        const response = await mem0.getMemories(validated);
        const output = {
            memories: response.results,
            count: response.count,
            page: validated.page || 1,
            page_size: validated.page_size || 100
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error getting memories: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: update_memory
// ============================================================================
server.registerTool('update_memory', {
    title: 'Update Memory',
    description: 'Update memory text or metadata by ID. Use for corrections, enrichment, or metadata updates.',
    inputSchema: {
        memory_id: UpdateMemoryInputSchema.shape.memory_id,
        text: UpdateMemoryInputSchema.shape.text,
        metadata: UpdateMemoryInputSchema.shape.metadata
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const validated = UpdateMemoryInputSchema.parse(params);
        const memory = await mem0.updateMemory(validated);
        const output = {
            memory,
            updated: true
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error updating memory: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: delete_memory
// ============================================================================
server.registerTool('delete_memory', {
    title: 'Delete Memory',
    description: 'Permanently delete a memory by ID. Cannot be undone.',
    inputSchema: {
        memory_id: DeleteMemoryInputSchema.shape.memory_id
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const validated = DeleteMemoryInputSchema.parse(params);
        await mem0.deleteMemory(validated.memory_id);
        const output = {
            deleted: true,
            memory_id: validated.memory_id
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error deleting memory: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: submit_feedback
// ============================================================================
server.registerTool('submit_feedback', {
    title: 'Submit Feedback',
    description: 'Provide quality feedback (POSITIVE/NEGATIVE/VERY_NEGATIVE) on a memory. Used for training and quality improvement.',
    inputSchema: {
        memory_id: FeedbackInputSchema.shape.memory_id,
        feedback: FeedbackInputSchema.shape.feedback,
        feedback_reason: FeedbackInputSchema.shape.feedback_reason
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false
    }
}, async (params) => {
    try {
        ensureMem0();
        const validated = FeedbackInputSchema.parse(params);
        const result = await mem0.submitFeedback(validated);
        const output = {
            feedback_id: result.id,
            feedback: result.feedback,
            submitted: true
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error submitting feedback: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: get_memory
// ============================================================================
server.registerTool('get_memory', {
    title: 'Get Single Memory',
    description: 'Retrieve a single memory by its UUID. Returns full memory details including metadata, categories, and timestamps.',
    inputSchema: {
        memory_id: GetMemoryInputSchema.shape.memory_id
    },
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const validated = GetMemoryInputSchema.parse(params);
        const memory = await mem0.getMemory(validated.memory_id);
        const output = { memory };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error getting memory: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: batch_update_memories
// ============================================================================
server.registerTool('batch_update_memories', {
    title: 'Batch Update Memories',
    description: 'Update metadata for multiple memories at once. Efficient for bulk operations.',
    inputSchema: {
        memory_ids: BatchUpdateMemoriesInputSchema.shape.memory_ids,
        metadata: BatchUpdateMemoriesInputSchema.shape.metadata
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const AltSchema = z.object({
            memories: z.array(z.object({
                memory_id: z.string().uuid(),
                text: z.string().optional(),
                metadata: z.record(z.any()).optional()
            }))
        });
        let payload;
        if (params.memories) {
            const s = AltSchema.parse({ memories: params.memories });
            payload = s;
        }
        else {
            const validated = BatchUpdateMemoriesInputSchema.parse(params);
            payload = {
                memories: validated.memory_ids.map((id) => ({ memory_id: id, metadata: validated.metadata }))
            };
        }
        const result = await mem0.batchUpdateMemories(payload);
        return {
            content: [{ type: 'text', text: JSON.stringify({
                        message: result.message,
                        memory_ids: payload.memories.map(m => m.memory_id),
                        status: 'success'
                    }, null, 2) }]
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error batch updating memories: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: batch_delete_memories
// ============================================================================
server.registerTool('batch_delete_memories', {
    title: 'Batch Delete Memories',
    description: 'Delete multiple memories by their UUIDs. Cannot be undone.',
    inputSchema: {
        memory_ids: BatchDeleteMemoriesInputSchema.shape.memory_ids
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const validated = BatchDeleteMemoriesInputSchema.parse(params);
        const result = await mem0.batchDeleteMemories(validated);
        return {
            content: [{ type: 'text', text: JSON.stringify({
                        message: result.message,
                        memory_ids: validated.memory_ids,
                        status: 'success'
                    }, null, 2) }]
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error batch deleting memories: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: delete_memories_by_filter
// ============================================================================
server.registerTool('delete_memories_by_filter', {
    title: 'Delete Memories by Filter',
    description: 'Delete all memories matching filter criteria. Use with caution - cannot be undone.',
    inputSchema: {
        filters: DeleteMemoriesByFilterInputSchema.shape.filters,
        org_id: DeleteMemoriesByFilterInputSchema.shape.org_id,
        project_id: DeleteMemoriesByFilterInputSchema.shape.project_id
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const p = { ...params };
        p.filters = parseMaybeJsonObject(p.filters);
        // Note: For delete operations, inject org_id/project_id to ensure proper scoping
        injectOrgProjectIds(p);
        const validated = DeleteMemoriesByFilterInputSchema.parse(p);
        const result = await mem0.deleteMemoriesByFilter(validated);
        const output = {
            deleted_count: result.deleted_count,
            filters: validated.filters,
            success: true
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error deleting memories by filter: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: create_memory_export
// ============================================================================
server.registerTool('create_memory_export', {
    title: 'Create Memory Export',
    description: 'Request an export of memories. Returns an export ID to check status and download.',
    inputSchema: {
        filters: CreateMemoryExportInputSchema.shape.filters,
        org_id: CreateMemoryExportInputSchema.shape.org_id,
        project_id: CreateMemoryExportInputSchema.shape.project_id
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false
    }
}, async (params) => {
    try {
        ensureMem0();
        const p = { ...params };
        p.filters = parseMaybeJsonObject(p.filters);
        // Note: For export operations, inject org_id/project_id to ensure proper scoping
        injectOrgProjectIds(p);
        const validated = CreateMemoryExportInputSchema.parse(p);
        // Ensure filters is provided
        if (!validated.filters) {
            throw new Error('filters parameter is required');
        }
        const result = await mem0.createMemoryExport({
            filters: validated.filters,
            schema: {},
            org_id: validated.org_id,
            project_id: validated.project_id
        });
        const output = {
            export_id: result.id,
            message: result.message,
            info: 'Use get_memory_export to check status and download'
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error creating memory export: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: get_memory_export
// ============================================================================
server.registerTool('get_memory_export', {
    title: 'Get Memory Export',
    description: 'Check export status and get download URL when ready.',
    inputSchema: {
        export_id: GetMemoryExportInputSchema.shape.export_id
    },
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const validated = GetMemoryExportInputSchema.parse(params);
        const result = await mem0.getMemoryExport(validated.export_id);
        const output = {
            export_id: result.export_id,
            status: result.status,
            download_url: result.download_url,
            created_at: result.created_at
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error getting memory export: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: get_users
// ============================================================================
server.registerTool('get_users', {
    title: 'Get Users',
    description: 'List all users in the organization or project. Returns user IDs, names, emails, and types.',
    inputSchema: {
        org_id: GetUsersInputSchema.shape.org_id,
        project_id: GetUsersInputSchema.shape.project_id
    },
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const p = { ...params };
        // Note: NOT injecting org_id/project_id to allow viewing all users
        // Let Mem0 API handle scope based on API key
        const validated = GetUsersInputSchema.parse(p);
        const users = await mem0.getUsers(validated);
        const output = {
            users,
            count: users.length
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error getting users: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Tool: delete_user
// ============================================================================
server.registerTool('delete_user', {
    title: 'Delete User',
    description: 'Delete a user and all their associated memories. Cannot be undone.',
    inputSchema: {
        user_id: DeleteUserInputSchema.shape.user_id
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true
    }
}, async (params) => {
    try {
        ensureMem0();
        const validated = DeleteUserInputSchema.parse(params);
        await mem0.deleteUser(validated.user_id);
        const output = {
            deleted: true,
            user_id: validated.user_id
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
            structuredContent: output
        };
    }
    catch (error) {
        const errorMsg = formatZodError(error);
        return {
            content: [{
                    type: 'text',
                    text: `Error deleting user: ${errorMsg}`
                }],
            isError: true
        };
    }
});
// ============================================================================
// Prompts - Help users with common tasks
// ============================================================================
server.registerPrompt('add-memory', {
    title: 'Add Memory',
    description: 'Create a new memory from a conversation. Guides you through adding user/agent messages with proper scoping.',
    argsSchema: {
        content: z.string().describe('The content to remember'),
        user_id: z.string().optional().describe('User identifier (required unless using agent_id/app_id/run_id)'),
        agent_id: z.string().optional().describe('Agent identifier (optional)'),
        context: z.string().optional().describe('Additional context about when/why this memory was created')
    }
}, ({ content, user_id, agent_id, context }) => {
    const userIdPart = user_id || 'your_user_id';
    const agentPart = agent_id ? `, agent_id: "${agent_id}"` : '';
    const ctxNote = context ? `\n\nContext: ${context}` : '';
    return {
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Please add this memory to Mem0:\n\n"${content}"${ctxNote}\n\nUse tool: add_memories with:\n- messages: [{"role": "user", "content": "${content}"}]\n- user_id: "${userIdPart}"${agentPart}`
                }
            }
        ]
    };
});
server.registerPrompt('search-memories', {
    title: 'Search Memories',
    description: 'Search for relevant memories using natural language. Helps construct proper search queries with filters.',
    argsSchema: {
        query: z.string().describe('What to search for (natural language)'),
        user_id: z.string().optional().describe('Filter by user ID'),
        agent_id: z.string().optional().describe('Filter by agent ID'),
        date_from: z.string().optional().describe('Filter from date (YYYY-MM-DD)'),
        date_to: z.string().optional().describe('Filter to date (YYYY-MM-DD)')
    }
}, ({ query, user_id, agent_id, date_from, date_to }) => {
    let filters = '{}';
    const conditions = [];
    if (user_id)
        conditions.push(`{"user_id": "${user_id}"}`);
    if (agent_id)
        conditions.push(`{"agent_id": "${agent_id}"}`);
    if (date_from || date_to) {
        const dateFilter = {};
        if (date_from)
            dateFilter.gte = date_from;
        if (date_to)
            dateFilter.lte = date_to;
        conditions.push(`{"created_at": ${JSON.stringify(dateFilter)}}`);
    }
    if (conditions.length > 0) {
        if (conditions.length === 1) {
            filters = conditions[0];
        }
        else {
            filters = `{"AND": [${conditions.join(', ')}]}`;
        }
    }
    else {
        filters = `{"user_id": "your_user_id"}`;
    }
    return {
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Search memories for: "${query}"\n\nUse tool: search_memories with:\n- query: "${query}"\n- filters: ${filters}\n- top_k: 10`
                }
            }
        ]
    };
});
// ============================================================================
// Resources - Expose data for AI access
// ============================================================================
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
server.registerResource('memory-stats', 'mem0://stats', {
    title: 'Memory Statistics',
    description: 'Overview of memory counts and usage statistics',
    mimeType: 'application/json'
}, async (uri) => {
    try {
        ensureMem0();
        // Get users/entities to provide stats
        const users = await mem0.getUsers({});
        const stats = {
            total_entities: users.length,
            entity_types: users.reduce((acc, u) => {
                acc[u.type] = (acc[u.type] || 0) + 1;
                return acc;
            }, {}),
            server_info: {
                name: 'Mem0 MCP Server',
                version: '1.0.0',
                capabilities: ['add', 'search', 'get', 'update', 'delete', 'batch_ops', 'export', 'feedback']
            }
        };
        return {
            contents: [{
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify(stats, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            contents: [{
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        error: error instanceof Error ? error.message : 'Failed to fetch stats',
                        note: 'Ensure API key is configured'
                    }, null, 2)
                }]
        };
    }
});
server.registerResource('user-profile', new ResourceTemplate('mem0://users/{userId}', { list: undefined }), {
    title: 'User Memory Profile',
    description: 'Get memories for a specific user'
}, async (uri, { userId }) => {
    try {
        ensureMem0();
        // userId can be string or string[] from ResourceTemplate, use first value if array
        const userIdStr = Array.isArray(userId) ? userId[0] : userId;
        const response = await mem0.getMemories({
            user_id: userIdStr,
            page: 1,
            page_size: 10
        });
        return {
            contents: [{
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        user_id: userId,
                        memory_count: response.count,
                        recent_memories: response.results.slice(0, 5).map((m) => ({
                            id: m.id,
                            memory: m.memory,
                            created_at: m.created_at
                        }))
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            contents: [{
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        user_id: userId,
                        error: error instanceof Error ? error.message : 'Failed to fetch user memories'
                    }, null, 2)
                }]
        };
    }
});
// ============================================================================
// Server Export (Smithery compatible)
// ============================================================================
// Export for Smithery platform
// Accepts config from Smithery's configSchema
export default function createServer({ config } = {}) {
    // Capture Smithery-provided session config for lazy client init
    lastConfig = config ?? null;
    return server.server;
}
// ============================================================================
// Server Launch (for stdio/local use)
// ============================================================================
// Only run stdio transport if executed directly (not imported by Smithery)
if (import.meta.url === `file://${process.argv[1]}`) {
    async function main() {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('Mem0 MCP Server running on stdio');
        const org = (lastConfig && lastConfig.orgId) || process.env.MEM0_ORG_ID || 'default';
        const proj = (lastConfig && lastConfig.projectId) || process.env.MEM0_PROJECT_ID || 'default';
        console.error(`Organization: ${org}`);
        console.error(`Project: ${proj}`);
    }
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map