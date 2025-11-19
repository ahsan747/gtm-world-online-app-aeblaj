const { withAppBuildGradle, withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withGtm = (config, { androidContainerPath }) => {
  // 1. Add the GTM dependency to android/app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('play-services-tagmanager')) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s?{/,
        `dependencies {
    implementation 'com.google.android.gms:play-services-tagmanager:18.1.0'`
      );
    }
    return config;
  });

  // 2. Copy the GTM JSON file to the Android assets/containers folder
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;

      // Source file (from your assets folder)
      const source = path.resolve(projectRoot, androidContainerPath);
      
      // Destination folder (android/app/src/main/assets/containers)
      const destinationFolder = path.join(platformRoot, 'app', 'src', 'main', 'assets', 'containers');

      // Check if source file exists to prevent build errors
      if (!fs.existsSync(source)) {
        throw new Error(`GTM Container file not found at: ${source}`);
      }

      // Create destination directory
      await fs.promises.mkdir(destinationFolder, { recursive: true });

      // Copy the file
      const destination = path.join(destinationFolder, path.basename(source));
      await fs.promises.copyFile(source, destination);

      return config;
    },
  ]);

  return config;
};

module.exports = createRunOncePlugin(withGtm, 'withGtm', '1.0.0');