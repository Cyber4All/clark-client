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
    performance: 0.97,
  }

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
    it ('Should return a total performance score of at least 97%', () => {
      expect(scores['performance'].score).toBeGreaterThanOrEqual(expectedLighthouseScores.performance);
    });
  });

  describe('Accessibility audits', () => {
    it ('Should return a total accessibility score of at least 86%', () => {
      expect(scores['accessibility'].score).toBeGreaterThanOrEqual(expectedLighthouseScores.accessibility);
    });
  });

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
              footer_icon: '../src/assets/images/logo_small.png',
              ts: Date.now()
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
