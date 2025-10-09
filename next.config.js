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
    optimizePackageImports: ['recharts', '@headlessui/react', 'react-currency-input-field', 'react-hot-toast', 'zustand'],
  },
  // Enable tree shaking and optimize imports
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Additional optimizations
  swcMinify: true,
  poweredByHeader: false,
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // More aggressive bundle splitting for better caching and smaller initial loads
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000, // 10KB - reduced for better splitting
        maxSize: 150000, // 150KB - reduced for smaller chunks
        cacheGroups: {
          // Separate recharts into its own chunk
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
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
          // Separate UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|react-currency-input-field)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Separate toast library
          toast: {
            test: /[\\/]node_modules[\\/]react-hot-toast[\\/]/,
            name: 'toast',
            chunks: 'all',
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
  },
  async rewrites() {
    return [
      {
        source: '/js/script.js',
        destination: 'https://datafa.st/js/script.js',
      },
      {
        source: '/api/events',
        destination: 'https://datafa.st/api/events',
      },
    ]
  },
};

module.exports = withBundleAnalyzer(nextConfig);
