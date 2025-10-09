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
    optimizePackageImports: ['recharts', '@headlessui/react', 'react-currency-input-field'],
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Split vendor chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 20,
          },
          headlessui: {
            test: /[\\/]node_modules[\\/]@headlessui[\\/]/,
            name: 'headlessui',
            chunks: 'all',
            priority: 20,
          },
          currencyInput: {
            test: /[\\/]node_modules[\\/]react-currency-input-field[\\/]/,
            name: 'currency-input',
            chunks: 'all',
            priority: 20,
          },
        },
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

module.exports = nextConfig;
