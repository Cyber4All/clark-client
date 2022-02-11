/* eslint-disable */
/**
 * This is a modified version of browser detection by user-agent from https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
 * The order matters here, and this may report false positives for unlisted browsers.
 */
const BROWSERS = {
  Firefox: 'Mozilla Firefox',
  Opera: 'Opera',
  Trident: 'Microsoft Internet Explorer',
  Edge: 'Microsoft Edge',
  Chrome: 'Google Chrome',
  Safari: 'Apple Safari'
};
const UNKNOWN_BROWSER = 'unknown';

const browserKeys = Object.keys(BROWSERS);

/**
 * Returns the Browser the user is using based on their user agent configuration.
 *
 * @export
 * @returns string
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
