/// Global application configuration for SheMove.
/// 
/// SET YOUR ACTIVE BACKEND / TUNNEL LINK IN THIS ONE VARIABLE:
class AppConfig {
  static String baseApiUrl = 'https://dust-burton-oxygen-assists.trycloudflare.com';

  /// Helper to update the base URL dynamically if changed via UI
  static void setUrl(String url) {
    baseApiUrl = url.trim().endsWith('/')
        ? url.trim().substring(0, url.trim().length - 1)
        : url.trim();
  }
}
