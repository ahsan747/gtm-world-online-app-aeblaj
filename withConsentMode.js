const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

module.exports = function withConsentMode(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // 1. SAFETY CHECK: If for some reason the manifest or application block is missing,
    // return the config without crashing so Expo can finish the prebuild.
    if (!androidManifest || !androidManifest.application || !androidManifest.application[0]) {
      console.warn("⚠️ withConsentMode: Manifest not ready yet, skipping this pass.");
      return config;
    }

    // 2. Ensure the 'tools' namespace exists
    if (!androidManifest.$['xmlns:tools']) {
      androidManifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const mainApplication = androidManifest.application[0];
    
    const consentSettings = [
      'google_analytics_default_allow_analytics_storage',
      'google_analytics_default_allow_ad_storage',
      'google_analytics_default_allow_ad_user_data',
      'google_analytics_default_allow_ad_personalization_signals',
    ];

    // Ensure meta-data array exists
    mainApplication['meta-data'] = mainApplication['meta-data'] || [];

    consentSettings.forEach((name) => {
      // Remove any existing entry for this name to prevent duplicates
      mainApplication['meta-data'] = mainApplication['meta-data'].filter(
        (item) => item.$ && item.$['android:name'] !== name
      );

      // Add the new entry with the 'tools:replace' attribute
      mainApplication['meta-data'].push({
        $: {
          'android:name': name,
          'android:value': 'false',
          'tools:replace': 'android:value',
        },
      });
    });

    return config;
  });
};