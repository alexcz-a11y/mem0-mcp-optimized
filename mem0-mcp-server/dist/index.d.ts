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
import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    apiKey: z.ZodString;
    orgId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    baseUrl: string;
    orgId?: string | undefined;
    projectId?: string | undefined;
}, {
    apiKey: string;
    orgId?: string | undefined;
    projectId?: string | undefined;
    baseUrl?: string | undefined;
}>;
export default function createServer({ config }?: {
    config?: any;
}): import("@modelcontextprotocol/sdk/server").Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;
//# sourceMappingURL=index.d.ts.map