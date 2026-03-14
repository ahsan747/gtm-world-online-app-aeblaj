const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withConsentMode(config) {
  return withAndroidManifest(config, async (config) => {
    const app = config.modResults.manifest.application[0];
    
    // Ensure the meta-data array exists
    app['meta-data'] = app['meta-data'] || [];
    
    // Inject the default denied states for Google Analytics
    app['meta-data'].push(
      { $: { 'android:name': 'google_analytics_default_allow_analytics_storage', 'android:value': 'false' } },
      { $: { 'android:name': 'google_analytics_default_allow_ad_storage', 'android:value': 'false' } },
      { $: { 'android:name': 'google_analytics_default_allow_ad_user_data', 'android:value': 'false' } },
      { $: { 'android:name': 'google_analytics_default_allow_ad_personalization_signals', 'android:value': 'false' } }
    );
    
    return config;
  });
};