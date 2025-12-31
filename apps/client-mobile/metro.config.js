const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Packages that need to be deduplicated (only one instance should exist)
const packagesToDedupe = [
  'react',
  'react-native',
  '@tanstack/react-query',
  '@tanstack/query-core',
];

const config = {
  resolver: {
    // List client-mobile's node_modules FIRST so it takes priority
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // Force specific packages to resolve from client-mobile
    extraNodeModules: {
      'react': path.resolve(projectRoot, 'node_modules/react'),
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
      '@tanstack/react-query': path.resolve(projectRoot, 'node_modules/@tanstack/react-query'),
      '@tanstack/query-core': path.resolve(projectRoot, 'node_modules/@tanstack/query-core'),
    },
    // Custom resolver to ensure packages are deduplicated regardless of where they're imported from
    resolveRequest: (context, moduleName, platform) => {
      // Check if this is a package we want to dedupe
      for (const pkg of packagesToDedupe) {
        if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
          const resolvedPath = path.resolve(projectRoot, 'node_modules', moduleName);
          return context.resolveRequest(
            {...context, originModulePath: projectRoot + '/index.js'},
            moduleName,
            platform,
          );
        }
      }
      // Default resolution for everything else
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  watchFolders: [workspaceRoot],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
