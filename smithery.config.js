/**
 * Smithery Build Configuration
 * 
 * Configures esbuild for the Smithery TypeScript runtime.
 * This ensures proper bundling and external dependency handling.
 */

export default {
  esbuild: {
    // External dependencies that should not be bundled
    external: [
      // Smithery CLI bootstrap internals and logging
      "@smithery/sdk",
      "@smithery/sdk/*",
      "@smithery/sdk/server/stateful.js",
      "@smithery/sdk/server/stateless.js",
      "chalk",
      // Common native/heavy dependencies only
      "@grpc/grpc-js",
      "sharp",
      "playwright-core",
      "puppeteer-core"
    ],
    
    // Target Node.js 18+ (Smithery requirement)
    target: "node18",
    
    // Output format should be ESM for proper import.meta support
    format: "esm",
    
    // Enable minification for production
    minify: true,
    
    // Platform target
    platform: "node"
  }
};
