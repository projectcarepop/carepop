import path from 'path';
import { fileURLToPath } from 'url';

// Calculate __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', 'react-native-vector-icons'],

  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(ttf|otf|woff|woff2)$/,
      type: 'asset/resource',
      generator: {
          filename: 'static/media/[name].[hash][ext]'
      },
      include: path.resolve(__dirname, '../../node_modules/react-native-vector-icons'),
    });

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    }

    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ]

    return config;
  },
};

export default nextConfig; 