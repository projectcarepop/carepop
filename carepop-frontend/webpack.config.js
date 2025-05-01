const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development', // Default to development mode
  entry: './index.web.js', // Entry point for the web app
  output: {
    path: path.resolve(__dirname, 'dist/web'), // Output directory for web build
    filename: 'bundle.web.js',
  },
  resolve: {
    // Alias react-native to react-native-web
    alias: {
      'react-native$': 'react-native-web',
    },
    // Add standard RN extensions and ensure .web.js is resolved first
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        // Use babel-loader for JavaScript/JSX/TypeScript files
        test: /\.(js|jsx|ts|tsx)$/,
        // Exclude node_modules except for react-native-vector-icons and potentially others
        // You might need to add more libraries here if they require transpilation
        exclude: /node_modules\/(?!react-native-vector-icons|nativewind)/,
        use: {
          loader: 'babel-loader',
          options: {
            // Prevent Babel from searching for other config files
            babelrc: false,
            configFile: false,
            // Pass the configuration directly
            presets: ['module:@react-native/babel-preset'],
            plugins: [
              [
                'module:react-native-dotenv',
                {
                  moduleName: '@env',
                  path: '.env',
                  blacklist: null,
                  whitelist: null,
                  safe: false,
                  allowUndefined: true,
                },
              ],
              'nativewind/babel', // Ensure this is active for webpack build
            ],
          },
        },
      },
      // Add loaders for other assets like images, fonts if needed
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    // Generate index.html based on the template
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve static files from public
    },
    compress: true,
    port: 8082, // Changed port to 8082 to avoid conflict
    historyApiFallback: true, // Important for single-page apps
  },
}; 