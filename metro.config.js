const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);

// Enable package exports so Metro can resolve subpath imports (e.g. react-native-css-interop/jsx-runtime)
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: "./global.css" });
