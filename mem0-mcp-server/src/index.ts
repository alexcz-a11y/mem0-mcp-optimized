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
import { Mem0Client } from './mem0-client.js';
import {
  AddMemoriesInputSchema,
  SearchMemoriesInputSchema,
  GetMemoriesInputSchema,
  UpdateMemoryInputSchema,
  DeleteMemoryInputSchema,
  FeedbackInputSchema,
  GetMemoryInputSchema,
  BatchUpdateMemoriesInputSchema,
  BatchDeleteMemoriesInputSchema,
  DeleteMemoriesByFilterInputSchema,
  CreateMemoryExportInputSchema,
  GetMemoryExportInputSchema,
  GetUsersInputSchema,
  DeleteUserInputSchema
} from './types.js';

// ============================================================================
// Configuration
// ============================================================================

const API_KEY = process.env.MEM0_API_KEY;
if (!API_KEY) {
  console.error('Error: MEM0_API_KEY environment variable is required');
  process.exit(1);
}

const config = {
  apiKey: API_KEY,
  orgId: process.env.MEM0_ORG_ID,
  projectId: process.env.MEM0_PROJECT_ID,
  baseUrl: process.env.MEM0_BASE_URL
};

const mem0 = new Mem0Client(config);

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

server.registerTool(
  'add_memories',
  {
    title: 'Add Memories',
    description: 'Store new memories from conversations. Supports v2 API with graph memory, metadata, and entity tracking. Returns memory IDs and extracted content.',
    inputSchema: {
      messages: AddMemoriesInputSchema.shape.messages,
      user_id: AddMemoriesInputSchema.shape.user_id,
      agent_id: AddMemoriesInputSchema.shape.agent_id,
      app_id: AddMemoriesInputSchema.shape.app_id,
      run_id: AddMemoriesInputSchema.shape.run_id,
      metadata: AddMemoriesInputSchema.shape.metadata,
      enable_graph: AddMemoriesInputSchema.shape.enable_graph,
      immutable: AddMemoriesInputSchema.shape.immutable,
      expiration_date: AddMemoriesInputSchema.shape.expiration_date,
      org_id: AddMemoriesInputSchema.shape.org_id,
      project_id: AddMemoriesInputSchema.shape.project_id,
      version: AddMemoriesInputSchema.shape.version
    }
  },
  async (params) => {
    try {
      const validated = AddMemoriesInputSchema.parse(params);
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error adding memories: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: search_memories
// ============================================================================

server.registerTool(
  'search_memories',
  {
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
    }
  },
  async (params) => {
    try {
      const validated = SearchMemoriesInputSchema.parse(params);
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error searching memories: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: get_memories
// ============================================================================

server.registerTool(
  'get_memories',
  {
    title: 'Get Memories',
    description: 'List memories by filters without semantic search. Supports pagination and same filter syntax as search. Use for browsing by entity, date range, or metadata.',
    inputSchema: {
      filters: GetMemoriesInputSchema.shape.filters,
      page: GetMemoriesInputSchema.shape.page,
      page_size: GetMemoriesInputSchema.shape.page_size,
      fields: GetMemoriesInputSchema.shape.fields,
      org_id: GetMemoriesInputSchema.shape.org_id,
      project_id: GetMemoriesInputSchema.shape.project_id
    }
  },
  async (params) => {
    try {
      const validated = GetMemoriesInputSchema.parse(params);
      const memories = await mem0.getMemories(validated);
      
      const output = {
        memories,
        count: memories.length,
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error getting memories: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: update_memory
// ============================================================================

server.registerTool(
  'update_memory',
  {
    title: 'Update Memory',
    description: 'Update memory text or metadata by ID. Use for corrections, enrichment, or metadata updates.',
    inputSchema: {
      memory_id: UpdateMemoryInputSchema.shape.memory_id,
      text: UpdateMemoryInputSchema.shape.text,
      metadata: UpdateMemoryInputSchema.shape.metadata
    }
  },
  async (params) => {
    try {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error updating memory: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: delete_memory
// ============================================================================

server.registerTool(
  'delete_memory',
  {
    title: 'Delete Memory',
    description: 'Permanently delete a memory by ID. Cannot be undone.',
    inputSchema: {
      memory_id: DeleteMemoryInputSchema.shape.memory_id
    }
  },
  async (params) => {
    try {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error deleting memory: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: submit_feedback
// ============================================================================

server.registerTool(
  'submit_feedback',
  {
    title: 'Submit Feedback',
    description: 'Provide quality feedback (POSITIVE/NEGATIVE/VERY_NEGATIVE) on a memory. Used for training and quality improvement.',
    inputSchema: {
      memory_id: FeedbackInputSchema.shape.memory_id,
      feedback: FeedbackInputSchema.shape.feedback,
      feedback_reason: FeedbackInputSchema.shape.feedback_reason
    }
  },
  async (params) => {
    try {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error submitting feedback: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: get_memory
// ============================================================================

server.registerTool(
  'get_memory',
  {
    title: 'Get Single Memory',
    description: 'Retrieve a single memory by its UUID. Returns full memory details including metadata, categories, and timestamps.',
    inputSchema: {
      memory_id: GetMemoryInputSchema.shape.memory_id
    }
  },
  async (params) => {
    try {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error getting memory: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: batch_update_memories
// ============================================================================

server.registerTool(
  'batch_update_memories',
  {
    title: 'Batch Update Memories',
    description: 'Update metadata for multiple memories at once. Efficient for bulk operations.',
    inputSchema: {
      memory_ids: BatchUpdateMemoriesInputSchema.shape.memory_ids,
      metadata: BatchUpdateMemoriesInputSchema.shape.metadata
    }
  },
  async (params) => {
    try {
      const validated = BatchUpdateMemoriesInputSchema.parse(params);
      const memories = validated.memory_ids.map((id: string) => ({
        memory_id: id,
        text: 'Updated',
        metadata: validated.metadata
      }));
      const result = await mem0.batchUpdateMemories({ memories });
      return {
        content: [{ type: 'text', text: JSON.stringify({
          message: result.message,
          memory_ids: validated.memory_ids,
          status: 'success'
        }, null, 2) }]
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error batch updating memories: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: batch_delete_memories
// ============================================================================

server.registerTool(
  'batch_delete_memories',
  {
    title: 'Batch Delete Memories',
    description: 'Delete multiple memories by their UUIDs. Cannot be undone.',
    inputSchema: {
      memory_ids: BatchDeleteMemoriesInputSchema.shape.memory_ids
    }
  },
  async (params) => {
    try {
      const validated = BatchDeleteMemoriesInputSchema.parse(params);
      const result = await mem0.batchDeleteMemories(validated);
      return {
        content: [{ type: 'text', text: JSON.stringify({
          message: result.message,
          memory_ids: validated.memory_ids,
          status: 'success'
        }, null, 2) }]
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error batch deleting memories: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: delete_memories_by_filter
// ============================================================================

server.registerTool(
  'delete_memories_by_filter',
  {
    title: 'Delete Memories by Filter',
    description: 'Delete all memories matching filter criteria. Use with caution - cannot be undone.',
    inputSchema: {
      filters: DeleteMemoriesByFilterInputSchema.shape.filters,
      org_id: DeleteMemoriesByFilterInputSchema.shape.org_id,
      project_id: DeleteMemoriesByFilterInputSchema.shape.project_id
    }
  },
  async (params) => {
    try {
      const validated = DeleteMemoriesByFilterInputSchema.parse(params);
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error deleting memories by filter: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: create_memory_export
// ============================================================================

server.registerTool(
  'create_memory_export',
  {
    title: 'Create Memory Export',
    description: 'Request an export of memories. Returns an export ID to check status and download.',
    inputSchema: {
      filters: CreateMemoryExportInputSchema.shape.filters,
      org_id: CreateMemoryExportInputSchema.shape.org_id,
      project_id: CreateMemoryExportInputSchema.shape.project_id
    }
  },
  async (params) => {
    try {
      const validated = CreateMemoryExportInputSchema.parse(params);
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error creating memory export: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: get_memory_export
// ============================================================================

server.registerTool(
  'get_memory_export',
  {
    title: 'Get Memory Export',
    description: 'Check export status and get download URL when ready.',
    inputSchema: {
      export_id: GetMemoryExportInputSchema.shape.export_id
    }
  },
  async (params) => {
    try {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error getting memory export: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: get_users
// ============================================================================

server.registerTool(
  'get_users',
  {
    title: 'Get Users',
    description: 'List all users in the organization or project. Returns user IDs, names, emails, and types.',
    inputSchema: {
      org_id: GetUsersInputSchema.shape.org_id,
      project_id: GetUsersInputSchema.shape.project_id
    }
  },
  async (params) => {
    try {
      const validated = GetUsersInputSchema.parse(params);
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error getting users: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Tool: delete_user
// ============================================================================

server.registerTool(
  'delete_user',
  {
    title: 'Delete User',
    description: 'Delete a user and all their associated memories. Cannot be undone.',
    inputSchema: {
      user_id: DeleteUserInputSchema.shape.user_id
    }
  },
  async (params) => {
    try {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error deleting user: ${errorMsg}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Server Export (Smithery compatible)
// ============================================================================

// Export for Smithery platform
export default function() {
  return server;
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
    console.error(`Organization: ${config.orgId || 'default'}`);
    console.error(`Project: ${config.projectId || 'default'}`);
  }

  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
