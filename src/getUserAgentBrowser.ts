/**
 * This is a modified version of browser detection by user-agent from https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
 * The order matters here, and this may report false positives for unlisted browsers.
 */

const BROWSERS = {
  // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
  Firefox: 'Mozilla Firefox',
  // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
  Opera: 'Opera',
  // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
  Trident: 'Microsoft Internet Explorer',
  // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
  Edge: 'Microsoft Edge',
  // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
  Chrome: 'Google Chrome',
  // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
  Safari: 'Apple Safari'
};
const UNKNOWN_BROWSER = 'unknown';

const browserKeys = Object.keys(BROWSERS);

/**
 * Returns the Browser the user is using based on their user agent configuration.
 *
 * @export
 * @returns {string}
 */
export function getUserAgentBrowser(): string {
  if (window && window.navigator && window.navigator.userAgent) {
    const userAgent = window.navigator.userAgent;
    for (const key of browserKeys) {
      if (userAgent.indexOf(key) > -1) {
        return BROWSERS[key];
      }
    }
  }
  return UNKNOWN_BROWSER;
}
