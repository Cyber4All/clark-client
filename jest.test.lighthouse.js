const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const request = require('request-promise');

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
      expect(scores['performance'].score).toBeGreaterThanOrEqual(0.97);
    });
  });

  describe('Accessibility audits', () => {
    it ('Should return a total accessibility score of at least 86%', () => {
      expect(scores['accessibility'].score).toBeGreaterThanOrEqual(0.86);
    });
  });

  afterAll(async (done) => {
    if (process.env.CI === 'true') {
      const options = {
        uri: 'https://hooks.slack.com/services/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',
        json: true,
        body: {
          text: 
          `Accessibility Score: ${scores['accessibility'].score} 
          | Performance Score: ${scores['performance'].score}`,
        },
        method: 'POST',
      };
  
      await request(options);
      done();
    }
  });
});
