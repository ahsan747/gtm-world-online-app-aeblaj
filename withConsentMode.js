const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

module.exports = function withConsentMode(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    
    // 1. Ensure the 'tools' namespace exists on the root <manifest> tag
    if (!androidManifest.$['xmlns:tools']) {
      androidManifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);
    
    const consentSettings = [
      'google_analytics_default_allow_analytics_storage',
      'google_analytics_default_allow_ad_storage',
      'google_analytics_default_allow_ad_user_data',
      'google_analytics_default_allow_ad_personalization_signals',
    ];

    // Ensure the meta-data array exists
    mainApplication['meta-data'] = mainApplication['meta-data'] || [];

    consentSettings.forEach((name) => {
      // Remove any existing entry for this name to prevent duplicates
      mainApplication['meta-data'] = mainApplication['meta-data'].filter(
        (item) => item.$['android:name'] !== name
      );

      // Add the new entry with the 'tools:replace' attribute to override the library default
      mainApplication['meta-data'].push({
        $: {
          'android:name': name,
          'android:value': 'false',
          'tools:replace': 'android:value', // THIS IS THE FIX
        },
      });
    });

    return config;
  });
};