/**
 * Mem0 MCP Server - Type Definitions
 * Based on official Mem0 Platform API Reference
 * https://docs.mem0.ai/api-reference
 */
import { z } from 'zod';
// ============================================================================
// Memory Schemas (Zod for MCP input validation)
// ============================================================================
export const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
});
export const AddMemoriesInputSchema = z.object({
    messages: z.array(MessageSchema),
    user_id: z.string().optional(),
    agent_id: z.string().optional(),
    app_id: z.string().optional(),
    run_id: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    enable_graph: z.boolean().optional(),
    immutable: z.boolean().optional(),
    expiration_date: z.string().optional(), // YYYY-MM-DD
    org_id: z.string().optional(),
    project_id: z.string().optional(),
    version: z.enum(['v1', 'v2']).default('v2')
});
export const SearchMemoriesInputSchema = z.object({
    query: z.string(),
    filters: z.record(z.any()),
    version: z.enum(['v2']).default('v2'),
    top_k: z.number().default(10),
    threshold: z.number().default(0.3),
    rerank: z.boolean().default(false),
    fields: z.array(z.string()).optional(),
    org_id: z.string().optional(),
    project_id: z.string().optional()
});
export const GetMemoriesInputSchema = z.object({
    filters: z.record(z.any()),
    page: z.number().default(1),
    page_size: z.number().default(100),
    fields: z.array(z.string()).optional(),
    org_id: z.string().optional(),
    project_id: z.string().optional()
});
export const UpdateMemoryInputSchema = z.object({
    memory_id: z.string().uuid(),
    text: z.string().optional(),
    metadata: z.record(z.any()).optional()
});
export const DeleteMemoryInputSchema = z.object({
    memory_id: z.string().uuid()
});
export const FeedbackInputSchema = z.object({
    memory_id: z.string().uuid(),
    feedback: z.enum(['POSITIVE', 'NEGATIVE', 'VERY_NEGATIVE']),
    feedback_reason: z.string().optional()
});
export const GetMemoryInputSchema = z.object({
    memory_id: z.string().uuid()
});
export const BatchUpdateMemoriesInputSchema = z.object({
    memory_ids: z.array(z.string().uuid()),
    metadata: z.record(z.any()).optional()
});
export const BatchDeleteMemoriesInputSchema = z.object({
    memory_ids: z.array(z.string().uuid())
});
export const DeleteMemoriesByFilterInputSchema = z.object({
    filters: z.record(z.any()),
    org_id: z.string().optional(),
    project_id: z.string().optional()
});
export const CreateMemoryExportInputSchema = z.object({
    filters: z.record(z.any()).optional(),
    org_id: z.string().optional(),
    project_id: z.string().optional()
});
export const GetMemoryExportInputSchema = z.object({
    export_id: z.string().uuid()
});
export const GetUsersInputSchema = z.object({
    org_id: z.string().optional(),
    project_id: z.string().optional()
});
export const DeleteUserInputSchema = z.object({
    user_id: z.string()
});
//# sourceMappingURL=types.js.map