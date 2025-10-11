const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      'financialmodelingprep.com'
    ],
  },
  // Optimize bundle splitting
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['recharts', 'react-currency-input-field', 'react-hot-toast', 'zustand', 'axios', 'next-auth'],
  },
  // Enable tree shaking and optimize imports
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Additional performance optimizations
  output: 'standalone',
  generateEtags: false,
  compress: true,
  // Additional optimizations
  swcMinify: true,
  poweredByHeader: false,
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // More aggressive bundle splitting for better caching and smaller initial loads
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 5000, // 5KB - reduced for better splitting
        maxSize: 100000, // 100KB - reduced for smaller chunks
        cacheGroups: {
          // Separate recharts into its own chunk with lazy loading
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'async', // Only load when needed
            priority: 30,
            enforce: true,
          },
          // Separate auth-related libraries
          auth: {
            test: /[\\/]node_modules[\\/](next-auth|@auth)[\\/]/,
            name: 'auth',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Separate UI libraries with lazy loading
          ui: {
            test: /[\\/]node_modules[\\/](react-currency-input-field)[\\/]/,
            name: 'ui',
            chunks: 'async', // Only load when needed
            priority: 25,
            enforce: true,
          },
          // Separate toast library with lazy loading
          toast: {
            test: /[\\/]node_modules[\\/]react-hot-toast[\\/]/,
            name: 'toast',
            chunks: 'async', // Only load when needed
            priority: 25,
            enforce: true,
          },
          // Separate state management
          state: {
            test: /[\\/]node_modules[\\/]zustand[\\/]/,
            name: 'state',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Separate database/API libraries
          database: {
            test: /[\\/]node_modules[\\/](mongoose|mongodb|ioredis)[\\/]/,
            name: 'database',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Separate payment libraries
          payments: {
            test: /[\\/]node_modules[\\/]stripe[\\/]/,
            name: 'payments',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Default vendor chunk for everything else
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            minChunks: 1,
          },
        },
      };

      // Enable tree shaking and dead code elimination
      config.optimization.sideEffects = false;
      
      // Additional optimizations
      config.optimization.concatenateModules = true;
      config.optimization.minimize = true;
      
      // Optimize CSS extraction
      if (config.module && config.module.rules) {
        config.module.rules.forEach(rule => {
          if (rule.oneOf) {
            rule.oneOf.forEach(oneOf => {
              if (oneOf.use && Array.isArray(oneOf.use)) {
                oneOf.use.forEach(use => {
                  if (use.loader && use.loader.includes('css-loader')) {
                    use.options = {
                      ...use.options,
                      modules: false,
                      sourceMap: false,
                    };
                  }
                });
              }
            });
          }
        });
      }
      
      // Optimize module resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        // Add any specific aliases if needed
      };
    }
    return config;
  }
};

module.exports = withBundleAnalyzer(nextConfig);
