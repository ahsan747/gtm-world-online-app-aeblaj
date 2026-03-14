const { withAndroidManifest } = require('@expo/config-plugins');

// Helper function to safely add or update meta-data without duplicating
function setMetaData(app, name, value) {
  const existingIndex = app['meta-data'].findIndex(
    (item) => item.$['android:name'] === name
  );

  if (existingIndex > -1) {
    app['meta-data'][existingIndex].$['android:value'] = value;
  } else {
    app['meta-data'].push({
      $: {
        'android:name': name,
        'android:value': value,
      },
    });
  }
}

module.exports = function withConsentMode(config) {
  return withAndroidManifest(config, async (config) => {
    const app = config.modResults.manifest.application[0];
    
    // Ensure the meta-data array exists
    app['meta-data'] = app['meta-data'] || [];

    // Safely inject the default denied states
    setMetaData(app, 'google_analytics_default_allow_analytics_storage', 'false');
    setMetaData(app, 'google_analytics_default_allow_ad_storage', 'false');
    setMetaData(app, 'google_analytics_default_allow_ad_user_data', 'false');
    setMetaData(app, 'google_analytics_default_allow_ad_personalization_signals', 'false');

    return config;
  });
};