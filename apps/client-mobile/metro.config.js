const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

// Get the monorepo root (two levels up from this file)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // Force all React imports to resolve to the same version
    extraNodeModules: {
      'react': path.resolve(projectRoot, 'node_modules/react'),
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

