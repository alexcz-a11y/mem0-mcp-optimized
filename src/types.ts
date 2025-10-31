/**
 * Mem0 MCP Server - Type Definitions
 * Based on official Mem0 Platform API Reference
 * https://docs.mem0.ai/api-reference
 */

import { z } from 'zod';

// ============================================================================
// Mem0 API Configuration
// ============================================================================

export interface Mem0Config {
  apiKey: string;
  orgId?: string;
  projectId?: string;
  baseUrl?: string;
}

// ============================================================================
// Memory Schemas (Zod for MCP input validation)
// ============================================================================

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']).describe('Role of the message sender (user or assistant)'),
  content: z.string().describe('Text content of the message')
});

export const AddMemoriesInputCoreSchema = z.object({
  messages: z.array(MessageSchema).describe('Array of conversation messages with role and content. At least one message is required.'),
  user_id: z.string().optional().describe('User identifier for scoping memories. Provide at least one of: user_id, agent_id, app_id, or run_id.'),
  agent_id: z.string().optional().describe('Agent/assistant identifier for scoping memories. Provide at least one of: user_id, agent_id, app_id, or run_id.'),
  app_id: z.string().optional().describe('Application identifier for scoping memories. Provide at least one of: user_id, agent_id, app_id, or run_id.'),
  run_id: z.string().optional().describe('Run/session identifier for scoping memories. Provide at least one of: user_id, agent_id, app_id, or run_id.'),
  metadata: z.record(z.any()).optional().describe('Additional metadata to attach to memories as key-value pairs'),
  enable_graph: z.boolean().optional().describe('Enable graph-based memory relationships (default: true for v2)'),
  immutable: z.boolean().optional().describe('Mark memories as immutable/read-only (default: false)'),
  expiration_date: z.string().optional().describe('Expiration date in YYYY-MM-DD format. Memories will be deleted after this date.'),
  includes: z.string().optional().describe('Comma-separated fields to include in extraction'),
  excludes: z.string().optional().describe('Comma-separated fields to exclude from extraction'),
  infer: z.boolean().optional().describe('Enable AI inference for memory extraction'),
  output_format: z.string().optional().describe('Output format specification (e.g., "v1.1" for graph relationships)'),
  custom_categories: z.record(z.any()).optional().describe('Custom category definitions for memory classification'),
  custom_instructions: z.string().optional().describe('Custom instructions for memory extraction behavior'),
  async_mode: z.boolean().optional().describe('Process memories asynchronously (default: false)'),
  timestamp: z.number().optional().describe('Unix timestamp for memory creation time override'),
  org_id: z.string().optional().describe('Organization ID override (defaults to server config)'),
  project_id: z.string().optional().describe('Project ID override (defaults to server config)'),
  version: z.enum(['v1', 'v2']).default('v2').describe('API version to use (v2 recommended for graph memory)')
});

export const AddMemoriesInputSchema = AddMemoriesInputCoreSchema.superRefine((val, ctx) => {
  if (!val.user_id && !val.agent_id && !val.app_id && !val.run_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['user_id'],
      message: 'At least one of user_id, agent_id, app_id, or run_id is required by Mem0 API'
    });
  }
});

export const SearchMemoriesInputSchema = z.object({
  query: z.string().describe('Natural language search query to find relevant memories'),
  filters: z.record(z.any()).describe('Filter criteria (required, non-empty). Supports AND/OR/NOT logic, comparison operators (in/gte/lte/gt/lt/ne/contains/icontains), and wildcard (*). Example: {"user_id": "alice"} or {"AND": [{"user_id": "alice"}, {"created_at": {"gte": "2025-01-01"}}]}'),
  version: z.enum(['v2']).default('v2').describe('API version (v2 only)'),
  top_k: z.number().default(10).describe('Maximum number of results to return (default: 10)'),
  threshold: z.number().default(0.3).describe('Minimum similarity threshold for results (0-1, default: 0.3)'),
  rerank: z.boolean().default(false).describe('Apply reranking to improve result relevance (default: false)'),
  keyword_search: z.boolean().optional().describe('Use keyword-based search instead of semantic search'),
  filter_memories: z.boolean().optional().describe('Apply additional memory filtering'),
  fields: z.array(z.string()).optional().describe('Specific fields to return in results (omit for all fields)'),
  org_id: z.string().optional().describe('Organization ID override'),
  project_id: z.string().optional().describe('Project ID override')
});

export const GetMemoriesInputSchema = z.object({
  filters: z.record(z.any()).describe('Filter criteria (required, non-empty). Supports AND/OR/NOT logic, comparison operators, and wildcard (*). Example: {"user_id": "alice"} or {"run_id": "*"}. See https://docs.mem0.ai/api-reference/memory/get-memories'),
  page: z.number().default(1).describe('Page number for pagination (default: 1)'),
  page_size: z.number().default(100).describe('Number of items per page (default: 100, max recommended: 100)'),
  fields: z.array(z.string()).optional().describe('Specific fields to return (omit for all fields)'),
  org_id: z.string().optional().describe('Organization ID override'),
  project_id: z.string().optional().describe('Project ID override')
});

export const UpdateMemoryInputSchema = z.object({
  memory_id: z.string().uuid().describe('UUID of the memory to update'),
  text: z.string().optional().describe('New text content for the memory (optional, preserves existing if omitted)'),
  metadata: z.record(z.any()).optional().describe('New metadata (optional, merges with existing)')
});

export const DeleteMemoryInputSchema = z.object({
  memory_id: z.string().uuid().describe('UUID of the memory to permanently delete')
});

export const FeedbackInputSchema = z.object({
  memory_id: z.string().uuid().describe('UUID of the memory to provide feedback on'),
  feedback: z.enum(['POSITIVE', 'NEGATIVE', 'VERY_NEGATIVE']).describe('Feedback rating: POSITIVE (high quality), NEGATIVE (low quality), or VERY_NEGATIVE (incorrect/harmful)'),
  feedback_reason: z.string().optional().describe('Optional explanation for the feedback rating')
});

export const GetMemoryInputSchema = z.object({
  memory_id: z.string().uuid().describe('UUID of the memory to retrieve')
});

export const BatchUpdateMemoriesInputSchema = z.object({
  memory_ids: z.array(z.string().uuid()).describe('Array of memory UUIDs to update (max 1000)'),
  metadata: z.record(z.any()).optional().describe('Metadata to apply to all specified memories')
});

export const BatchDeleteMemoriesInputSchema = z.object({
  memory_ids: z.array(z.string().uuid()).describe('Array of memory UUIDs to permanently delete (max 1000)')
});

export const DeleteMemoriesByFilterInputSchema = z.object({
  filters: z.record(z.any()).describe('Filter criteria to select memories for deletion (required, non-empty). Use with caution - all matching memories will be permanently deleted!'),
  org_id: z.string().optional().describe('Organization ID override'),
  project_id: z.string().optional().describe('Project ID override')
});

export const CreateMemoryExportInputSchema = z.object({
  filters: z.record(z.any()).optional().describe('Filter criteria to select memories for export (required in practice). Returns export ID for download.'),
  org_id: z.string().optional().describe('Organization ID override'),
  project_id: z.string().optional().describe('Project ID override')
});

export const GetMemoryExportInputSchema = z.object({
  export_id: z.string().uuid().describe('UUID of the export to check status and retrieve download URL')
});

export const GetUsersInputSchema = z.object({
  org_id: z.string().optional().describe('Organization ID to filter users (defaults to server config)'),
  project_id: z.string().optional().describe('Project ID to filter users (defaults to server config)')
});

export const DeleteUserInputSchema = z.object({
  user_id: z.string().describe('User ID to delete along with all associated memories (permanent action)')
});

// ============================================================================
// Memory Response Types
// ============================================================================

export interface Memory {
  id: string;
  memory: string;
  user_id?: string;
  agent_id?: string;
  app_id?: string;
  run_id?: string;
  metadata?: Record<string, any>;
  categories?: string[];
  immutable?: boolean;
  expiration_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddMemoryResponse {
  id: string;
  data: {
    memory: string;
  };
  event: 'ADD' | 'UPDATE' | 'DELETE';
}

export interface SearchMemoriesResponse {
  memories: Memory[];
}

export interface FeedbackResponse {
  id: string;
  feedback: 'POSITIVE' | 'NEGATIVE' | 'VERY_NEGATIVE';
  feedback_reason?: string;
}

export interface BatchUpdateResponse {
  updated_count: number;
  memory_ids: string[];
}

export interface BatchDeleteResponse {
  deleted_count: number;
  memory_ids: string[];
}

export interface MemoryExportResponse {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  created_at: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  type: 'person' | 'bot';
}
