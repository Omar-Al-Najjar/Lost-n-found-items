const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;

const config = getDefaultConfig(__dirname);

config.resolver.blockList = exclusionList([
  /android[\/\\]build[\/\\].*/,
  /android[\/\\]app[\/\\]build[\/\\].*/,
  /android[\/\\]\.gradle[\/\\].*/,
  /android[\/\\]app[\/\\]\.cxx[\/\\].*/,
  /node_modules[\/\\].+[\/\\]android[\/\\]build[\/\\].*/,
  /node_modules[\/\\].+[\/\\]android[\/\\]\.cxx[\/\\].*/,
  path.resolve(__dirname, 'dist'),
  /ai[\/\\].*\.pyc$/,
  /ai[\/\\]__pycache__[\/\\].*/,
  /api[\/\\]__pycache__[\/\\].*/,
]);
config.resolver.unstable_enablePackageExports = false;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'whatwg-url-minimum': path.resolve(
    __dirname,
    'node_modules/whatwg-url-minimum/dist/whatwg-url-minimum.js'
  ),
  '@supabase/supabase-js': path.resolve(
    __dirname,
    'node_modules/@supabase/supabase-js/dist/index.cjs'
  ),
  'stacktrace-parser': path.resolve(
    __dirname,
    'node_modules/stacktrace-parser/dist/stack-trace-parser.cjs.js'
  ),
};

module.exports = config;
