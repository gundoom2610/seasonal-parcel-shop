import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { vitePrerenderPlugin } from "vite-prerender-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Server config only applies to development
  server: {
    host: "::",
    port: 8080,
  },
  
  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  
  // Base URL - important for Vercel deployments
  base: '/',
  
  plugins: [
    react(),
    // Only use componentTagger in development
    mode === 'development' && componentTagger(),
    // Prerender plugin for SEO - only in production build
    mode === 'production' && vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: path.resolve(__dirname, 'src/prerender.tsx'),
      // Static routes to prerender (dynamic routes are discovered via link crawling)
      additionalPrerenderRoutes: [
        '/',
        '/blog',
        '/return-policy',
      ],
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Define global constants
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}));