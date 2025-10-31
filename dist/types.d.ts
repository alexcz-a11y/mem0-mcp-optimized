/**
 * Mem0 MCP Server - Type Definitions
 * Based on official Mem0 Platform API Reference
 * https://docs.mem0.ai/api-reference
 */
import { z } from 'zod';
export interface Mem0Config {
    apiKey: string;
    orgId?: string;
    projectId?: string;
    baseUrl?: string;
}
export declare const MessageSchema: z.ZodObject<{
    role: z.ZodEnum<["user", "assistant"]>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "user" | "assistant";
    content: string;
}, {
    role: "user" | "assistant";
    content: string;
}>;
export declare const AddMemoriesInputCoreSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant";
        content: string;
    }, {
        role: "user" | "assistant";
        content: string;
    }>, "many">;
    user_id: z.ZodOptional<z.ZodString>;
    agent_id: z.ZodOptional<z.ZodString>;
    app_id: z.ZodOptional<z.ZodString>;
    run_id: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    enable_graph: z.ZodOptional<z.ZodBoolean>;
    immutable: z.ZodOptional<z.ZodBoolean>;
    expiration_date: z.ZodOptional<z.ZodString>;
    includes: z.ZodOptional<z.ZodString>;
    excludes: z.ZodOptional<z.ZodString>;
    infer: z.ZodOptional<z.ZodBoolean>;
    output_format: z.ZodOptional<z.ZodString>;
    custom_categories: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    custom_instructions: z.ZodOptional<z.ZodString>;
    async_mode: z.ZodOptional<z.ZodBoolean>;
    timestamp: z.ZodOptional<z.ZodNumber>;
    org_id: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodEnum<["v1", "v2"]>>;
}, "strip", z.ZodTypeAny, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    version: "v1" | "v2";
    includes?: string | undefined;
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    metadata?: Record<string, any> | undefined;
    enable_graph?: boolean | undefined;
    immutable?: boolean | undefined;
    expiration_date?: string | undefined;
    excludes?: string | undefined;
    infer?: boolean | undefined;
    output_format?: string | undefined;
    custom_categories?: Record<string, any> | undefined;
    custom_instructions?: string | undefined;
    async_mode?: boolean | undefined;
    timestamp?: number | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
}, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    includes?: string | undefined;
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    metadata?: Record<string, any> | undefined;
    enable_graph?: boolean | undefined;
    immutable?: boolean | undefined;
    expiration_date?: string | undefined;
    excludes?: string | undefined;
    infer?: boolean | undefined;
    output_format?: string | undefined;
    custom_categories?: Record<string, any> | undefined;
    custom_instructions?: string | undefined;
    async_mode?: boolean | undefined;
    timestamp?: number | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
    version?: "v1" | "v2" | undefined;
}>;
export declare const AddMemoriesInputSchema: z.ZodEffects<z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant";
        content: string;
    }, {
        role: "user" | "assistant";
        content: string;
    }>, "many">;
    user_id: z.ZodOptional<z.ZodString>;
    agent_id: z.ZodOptional<z.ZodString>;
    app_id: z.ZodOptional<z.ZodString>;
    run_id: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    enable_graph: z.ZodOptional<z.ZodBoolean>;
    immutable: z.ZodOptional<z.ZodBoolean>;
    expiration_date: z.ZodOptional<z.ZodString>;
    includes: z.ZodOptional<z.ZodString>;
    excludes: z.ZodOptional<z.ZodString>;
    infer: z.ZodOptional<z.ZodBoolean>;
    output_format: z.ZodOptional<z.ZodString>;
    custom_categories: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    custom_instructions: z.ZodOptional<z.ZodString>;
    async_mode: z.ZodOptional<z.ZodBoolean>;
    timestamp: z.ZodOptional<z.ZodNumber>;
    org_id: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodEnum<["v1", "v2"]>>;
}, "strip", z.ZodTypeAny, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    version: "v1" | "v2";
    includes?: string | undefined;
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    metadata?: Record<string, any> | undefined;
    enable_graph?: boolean | undefined;
    immutable?: boolean | undefined;
    expiration_date?: string | undefined;
    excludes?: string | undefined;
    infer?: boolean | undefined;
    output_format?: string | undefined;
    custom_categories?: Record<string, any> | undefined;
    custom_instructions?: string | undefined;
    async_mode?: boolean | undefined;
    timestamp?: number | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
}, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    includes?: string | undefined;
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    metadata?: Record<string, any> | undefined;
    enable_graph?: boolean | undefined;
    immutable?: boolean | undefined;
    expiration_date?: string | undefined;
    excludes?: string | undefined;
    infer?: boolean | undefined;
    output_format?: string | undefined;
    custom_categories?: Record<string, any> | undefined;
    custom_instructions?: string | undefined;
    async_mode?: boolean | undefined;
    timestamp?: number | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
    version?: "v1" | "v2" | undefined;
}>, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    version: "v1" | "v2";
    includes?: string | undefined;
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    metadata?: Record<string, any> | undefined;
    enable_graph?: boolean | undefined;
    immutable?: boolean | undefined;
    expiration_date?: string | undefined;
    excludes?: string | undefined;
    infer?: boolean | undefined;
    output_format?: string | undefined;
    custom_categories?: Record<string, any> | undefined;
    custom_instructions?: string | undefined;
    async_mode?: boolean | undefined;
    timestamp?: number | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
}, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    includes?: string | undefined;
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    metadata?: Record<string, any> | undefined;
    enable_graph?: boolean | undefined;
    immutable?: boolean | undefined;
    expiration_date?: string | undefined;
    excludes?: string | undefined;
    infer?: boolean | undefined;
    output_format?: string | undefined;
    custom_categories?: Record<string, any> | undefined;
    custom_instructions?: string | undefined;
    async_mode?: boolean | undefined;
    timestamp?: number | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
    version?: "v1" | "v2" | undefined;
}>;
export declare const SearchMemoriesInputSchema: z.ZodObject<{
    query: z.ZodString;
    filters: z.ZodRecord<z.ZodString, z.ZodAny>;
    version: z.ZodDefault<z.ZodEnum<["v2"]>>;
    top_k: z.ZodDefault<z.ZodNumber>;
    threshold: z.ZodDefault<z.ZodNumber>;
    rerank: z.ZodDefault<z.ZodBoolean>;
    keyword_search: z.ZodOptional<z.ZodBoolean>;
    filter_memories: z.ZodOptional<z.ZodBoolean>;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    org_id: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    version: "v2";
    query: string;
    filters: Record<string, any>;
    top_k: number;
    threshold: number;
    rerank: boolean;
    org_id?: string | undefined;
    project_id?: string | undefined;
    keyword_search?: boolean | undefined;
    filter_memories?: boolean | undefined;
    fields?: string[] | undefined;
}, {
    query: string;
    filters: Record<string, any>;
    org_id?: string | undefined;
    project_id?: string | undefined;
    version?: "v2" | undefined;
    top_k?: number | undefined;
    threshold?: number | undefined;
    rerank?: boolean | undefined;
    keyword_search?: boolean | undefined;
    filter_memories?: boolean | undefined;
    fields?: string[] | undefined;
}>;
export declare const GetMemoriesInputSchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodString>;
    agent_id: z.ZodOptional<z.ZodString>;
    app_id: z.ZodOptional<z.ZodString>;
    run_id: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    page_size: z.ZodDefault<z.ZodNumber>;
    org_id: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    page_size: number;
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
}, {
    user_id?: string | undefined;
    agent_id?: string | undefined;
    app_id?: string | undefined;
    run_id?: string | undefined;
    org_id?: string | undefined;
    project_id?: string | undefined;
    page?: number | undefined;
    page_size?: number | undefined;
}>;
export declare const UpdateMemoryInputSchema: z.ZodObject<{
    memory_id: z.ZodString;
    text: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    memory_id: string;
    metadata?: Record<string, any> | undefined;
    text?: string | undefined;
}, {
    memory_id: string;
    metadata?: Record<string, any> | undefined;
    text?: string | undefined;
}>;
export declare const DeleteMemoryInputSchema: z.ZodObject<{
    memory_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    memory_id: string;
}, {
    memory_id: string;
}>;
export declare const FeedbackInputSchema: z.ZodObject<{
    memory_id: z.ZodString;
    feedback: z.ZodEnum<["POSITIVE", "NEGATIVE", "VERY_NEGATIVE"]>;
    feedback_reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    memory_id: string;
    feedback: "POSITIVE" | "NEGATIVE" | "VERY_NEGATIVE";
    feedback_reason?: string | undefined;
}, {
    memory_id: string;
    feedback: "POSITIVE" | "NEGATIVE" | "VERY_NEGATIVE";
    feedback_reason?: string | undefined;
}>;
export declare const GetMemoryInputSchema: z.ZodObject<{
    memory_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    memory_id: string;
}, {
    memory_id: string;
}>;
export declare const BatchUpdateMemoriesInputSchema: z.ZodObject<{
    memory_ids: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    memory_ids: string[];
    metadata?: Record<string, any> | undefined;
}, {
    memory_ids: string[];
    metadata?: Record<string, any> | undefined;
}>;
export declare const BatchDeleteMemoriesInputSchema: z.ZodObject<{
    memory_ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    memory_ids: string[];
}, {
    memory_ids: string[];
}>;
export declare const DeleteMemoriesByFilterInputSchema: z.ZodObject<{
    filters: z.ZodRecord<z.ZodString, z.ZodAny>;
    org_id: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filters: Record<string, any>;
    org_id?: string | undefined;
    project_id?: string | undefined;
}, {
    filters: Record<string, any>;
    org_id?: string | undefined;
    project_id?: string | undefined;
}>;
export declare const CreateMemoryExportInputSchema: z.ZodObject<{
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    org_id: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    org_id?: string | undefined;
    project_id?: string | undefined;
    filters?: Record<string, any> | undefined;
}, {
    org_id?: string | undefined;
    project_id?: string | undefined;
    filters?: Record<string, any> | undefined;
}>;
export declare const GetMemoryExportInputSchema: z.ZodObject<{
    export_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    export_id: string;
}, {
    export_id: string;
}>;
export declare const GetUsersInputSchema: z.ZodObject<{
    org_id: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    org_id?: string | undefined;
    project_id?: string | undefined;
}, {
    org_id?: string | undefined;
    project_id?: string | undefined;
}>;
export declare const DeleteUserInputSchema: z.ZodObject<{
    user_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id: string;
}, {
    user_id: string;
}>;
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
//# sourceMappingURL=types.d.ts.map