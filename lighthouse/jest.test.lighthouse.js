const lighthouse = require("../node_modules/lighthouse");
const chromeLauncher = require("../node_modules/chrome-launcher");
const request = require('../node_modules/request-promise')

jest.setTimeout(60000);

describe('Lighthouse test runner', () => {
  let scores;
  const url = 'http://localhost:4200';
  const opts = { chromeFlags: [] };
  const config = {
    extends: 'lighthouse:default', // Extends Google's default config (https://github.com/GoogleChrome/lighthouse/blob/8f500e00243e07ef0a80b39334bedcc8ddc8d3d0/lighthouse-core/config/constants.js#L30-L48)
    settings: {
      throttlingMethod: 'provided', // Lighthouse v3 Flag to disable throttling
    }
  };
  const expectedLighthouseScores = {
    accessibility: 0.86,
    performance: 0.90,
  }

  /**
   * Opens a instance of Chrome and runs Lighthouse
   * on localhost:4200. The Chrome instance is destroyed after test completion
   * and the test results are stored in the scores variable.
   */
  beforeAll(async (done) => {
    chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
      opts.port = chrome.port;
      lighthouse(url, opts, config).then(results => {
        chrome.kill().then(() => {
          scores = results.lhr.categories;
          done();
        });
      });
    });
  });

  describe('Performace audits', () => {
    it ('Should return a total performance score of at least 90%', () => {
      expect(scores['performance'].score).toBeGreaterThanOrEqual(expectedLighthouseScores.performance);
    });
  });

  describe('Accessibility audits', () => {
    it ('Should return a total accessibility score of at least 86%', () => {
      expect(scores['accessibility'].score).toBeGreaterThanOrEqual(expectedLighthouseScores.accessibility);
    });
  });

  /**
   * Sends a Slack message if the tests were run in Circle CI.
   * The contents of the Slack message will change depending on if the tests
   * passed or failed.
   */
  afterAll(async (done) => {
    if (process.env.CI === 'true') {
      let passed;
      scores['accessibility'].score >= expectedLighthouseScores.accessibility && scores['performance'].score >= expectedLighthouseScores.performance ?
        passed = true
        : passed = false;
      const options = {
        uri: process.env.SLACK_URI,
        json: true,
        body: {
          text: 
            passed ?
              `Hey ${process.env.CIRCLE_USERNAME}, your Lighthouse tests passed in Circle CI!`
              : `Hey ${process.env.CIRCLE_USERNAME}, your Lighthouse tests failed in Circle CI`,
          attachments: [
            {
              fallback: `Performance: ${scores['performance'].score * 100}% | Accessibility: ${scores['accessibility'].score * 100}%`,
              color: 
                passed ?
                  '#00ff00'
                  : '#ff0000',
              title: 'Lighthouse Test Results',
              title_link: process.env.CIRCLE_BUILD_URL,
              fields: [
                {
                  title: 'Scores',
                  value: `Performance: ${scores['performance'].score * 100}% | Accessibility: ${scores['accessibility'].score * 100}%`,
                  short: false,
                }
              ],
              footer: 'CLARK',
              ts: Math.floor(Date.now() / 1000)
            }
          ]
        },
        method: 'POST',
      };
      await request(options);
    }
    done();
  });
});