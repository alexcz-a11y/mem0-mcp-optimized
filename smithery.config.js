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
      // Common native/heavy dependencies only
      "@grpc/grpc-js",
      "sharp",
      "playwright-core",
      "puppeteer-core"
    ],
    
    // Target Node.js 18+ (Smithery requirement)
    target: "node18",
    
    // Enable minification for production
    minify: true,
    
    // Platform target
    platform: "node"
  }
};
