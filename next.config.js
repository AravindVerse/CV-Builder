const WebpackObfuscator = require('webpack-obfuscator');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Ensures your production build generates a static asset folder named 'out'
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new WebpackObfuscator({
          rotateStringArray: true,
          stringArray: true,
          stringArrayThreshold: 0.75,
          controlFlowFlattening: true, 
          deadCodeInjection: true,     
        }, ['_next/static/development/*.js'])
      );
    }
    return config;
  },
};

module.exports = nextConfig;