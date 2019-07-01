const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

jest.setTimeout(60000);
let scores;

beforeAll(async () => {
  const url = 'http://localhost:4200';
  const opts = { chromeFlags: [] };
  const config = {
    throttling: {
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    }
  };

  chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
    return lighthouse(url, {...opts, port: chrome.port}, config).then(results =>
      chrome.kill().then(() => scores = results.lhr.audits)
    );
  });
});

describe('Performace audits', () => {
  it ('Should return a first-contentful-paint score of 0', () => {
    expect(scores['first-contentful-paint'].score).toBe(0);
  });

  it ('Should return a first-meaningful-paint score of 0', () => {
    expect(scores['first-meaningful-paint'].score).toBe(0);
  });

  it ('Should return a speed index score of 0', () => {
    expect(scores['speed-index'].score).toBe(0);
  });

  it ('Should return an interactive score of 0', () => {
    expect(scores['interactive'].score).toBe(0);
  });

  it ('Should return a first cpu idle score of 0', () => {
    expect(scores['first-cpu-idle'].score).toBe(0);
  });

  it ('Should return a max potential fid score of 0', () => {
    expect(scores['max-potential-fid'].score).toBe(0);
  });

  it ('Should return an estimated input latency score of 0', () => {
    expect(scores['estimated-input-latency'].score).toBe(0);
  });

  it ('Should return a render blocking resources score of 0', () => {
    expect(scores['render-blocking-resources'].score).toBe(0);
  });

  it ('Should return a uses responsive images score of 0', () => {
    expect(scores['uses-responsive-images'].score).toBe(0);
  });

  it ('Should return an offscreen images score of 0', () => {
    expect(scores['offscreen-images'].score).toBe(0);
  });

  it ('Should return an unminified css score of 0', () => {
    expect(scores['unminified-css'].score).toBe(0);
  });

  it ('Should return an unminified javasript score of 0', () => {
    expect(scores['unminified-javascript'].score).toBe(0);
  });

  it ('Should return an unused css rules score of 0', () => {
    expect(scores['unused-css-rules'].score).toBe(0);
  });

  it ('Should return a uses optimized images score of 0', () => {
    expect(scores['uses-optimized-images'].score).toBe(0);
  });

  it ('Should return a uses webp images score of 0', () => {
    expect(scores['uses-webp-images'].score).toBe(0);
  });

  it ('Should return a uses text compression score of 0', () => {
    expect(scores['uses-text-compression'].score).toBe(0);
  });

  it ('Should return a uses rel preconnect score of 0', () => {
    expect(scores['uses-rel-preconnect'].score).toBe(0);
  });

  it ('Should return a time to first byte score of 0', () => {
    expect(scores['time-to-first-byte'].score).toBe(0);
  });

  it ('Should return a redirects score of 0', () => {
    expect(scores['redirects'].score).toBe(0);
  });

  it ('Should return a uses ril preload score of 0', () => {
    expect(scores['uses-rel-preload'].score).toBe(0);
  });

  it ('Should return an efficient animated score of 0', () => {
    expect(scores['efficient-animated-content'].score).toBe(0);
  });

  it ('Should return a total byte weight score of 0', () => {
    expect(scores['total-byte-weight'].score).toBe(0);
  });
  
  it ('Should return a uses long cache ttl score of 0', () => {
    expect(scores['uses-long-cache-ttl'].score).toBe(0);
  });

  it ('Should return a dom size score of 0', () => {
    expect(scores['dom-size'].score).toBe(0);
  });
  
  it ('Should return a critical request chain score of 0', () => {
    expect(scores['critical-request-chains'].score).toBe(0);
  });

  it ('Should return a user timings score of 0', () => {
    expect(scores['user-timings'].score).toBe(0);
  });

  it ('Should return a bootup time score of 0', () => {
    expect(scores['bootup-time'].score).toBe(0);
  });

  it ('Should return a mainthread work breakdown score of 0', () => {
    expect(scores['mainthread-work-breakdown'].score).toBe(0);
  });

  it ('Should return a font display score oif 0', () => {
    expect(scores['font-display'].score).toBe(0);
  });

  it ('Should return a performance budget score of 0', () => {
    expect(scores['performance-budget'].score).toBe(0);
  });

  it ('Should return a resource summary score of 0', () => {
    expect(scores['resource-summary'].score).toBe(0);
  });

  it ('Should return a network requests score of 0', () => {
    expect(scores['network-requests'].score).toBe(0);
  });

  it ('Should return a network rtt score of 0', () => {
    expect(scores['network-rtt'].score).toBe(0);
  });

  it ('Should return a network server latency score of 0', () => {
    expect(scores['network-server-latency'].score).toBe(0);
  });
    
  it ('Should return a main thread tasks score of 0', () => {
    expect(scores['main-thread-tasks'].score).toBe(0);
  });
  
  it ('Should return a diagnostics score of 0' , () => {
    expect(scores['diagnostics'].score).toBe(0);
  });

  it ('Should return a metrics score of 0', () => {
    expect(scores['metrics'].score).toBe(0);
  });

  it ('Should return a screenshot thumbnail score of 0', () => {
    expect(scores['screenshot-thumbnails'].score).toBe(0);
  });

  it ('Should return a final screenshot score of 0', () => {
    expect(scores['final-screenshot'].score).toBe(0);
  });

});


describe('Accessibility audits', () => {
  it ('Should return an accesskeys score of 0', () => {
    expect(scores['accesskeys'].score).toBe(0);
  });
    
  it ('Should return an aria allowed attr score of 0', () => {
    expect(scores['aria-allowed-attr'].score).toBe(0);
  });

  it ('Should return an aria required attr score of 0', () => {
    expect(scores['aria-required-attr'].score).toBe(0);
  });

  it ('Should return an aria required children score of 0', () => {
    expect(scores['aria-required-children'].score).toBe(0);
  });

  it ('Should return an aria required parent score of 0', () => {
    expect(scores['aria-required-parent'].score).toBe(0);
  });
   
  it ('Should return an aria roles score of 0', () => {
    expect(scores['aria-roles'].score).toBe(0);
  });

  it ('Should return an aria valid attr value score of 0', () => {
    expect(scores['aria-valid-attr-value'].score).toBe(0);
  });

  it ('Should return an aria valid attr score of 0', () => {
    expect(scores['aria-valid-attr'].score).toBe(0);
  });
    
  it ('Should return an audio caption score of 0', () => {
    expect(scores['audio-caption'].score).toBe(0);
  });

  it ('Should return a button name score of 0', () => {
    expect(scores['button-name'].score).toBe(0);
  });

  it ('Should return a bypass score of 0', () => {
    expect(scores['bypass'].score).toBe(0);
  });
    
  it ('Should return a color contrast score of 0', () => {
    expect(scores['color-contrast'].score).toBe(0);
  });

  it ('Should return a definition list score of 0', () => {
    expect(scores['definition-list'].score).toBe(0);
  });

  it ('Should return a dlitem score of 0', () => {
    expect(scores['dlitem'].score).toBe(0);
  });
    
  it ('Should return a document title score of 0', () => {
    expect(scores['document-title'].score).toBe(0);
  });

  it ('Should return a duplicate id score of 0', () => {
    expect(scores['duplicate-id'].score).toBe(0);
  });
    
  it ('Should return a frame title score of 0', () => {
    expect(scores['frame-title'].score).toBe(0);
  });

  it ('Should return a html has lang score of 0', () => {
    expect(scores['html-has-lang'].score).toBe(0);
  });

  it ('Should return a html lang valid score of 0', () => {
    expect(scores['html-lang-valid'].score).toBe(0);
  });

  it ('Should return an image alt score of 0', () => {
    expect(scores['image-alt'].score).toBe(0);
  });

  it ('Should return an input image alt score of 0', () => {
    expect(scores['input-image-alt'].score).toBe(0);
  });

  it ('Should return a label score of 0', () => {
    expect(scores['label'].score).toBe(0);
  });

  it ('Should return a layout table score of 0', () => {
    expect(scores['layout-table'].score).toBe(0);
  });

  it ('Should return a link name score of 0', () => {
    expect(scores['link-name'].score).toBe(0);
  });

  it ('Should return a list score of 0', () => {
    expect(scores['list'].score).toBe(0);
  });

  it ('Should return a list item score of 0', () => {
    expect(scores['listitem'].score).toBe(0);
  });

  it ('Should return a meta refresh score of 0', () => {
    expect(scores['meta-refresh'].score).toBe(0);
  });

  it ('Should return a meta viewport score of 0', () => {
    expect(scores['meta-viewport'].score).toBe(0);
  });
   
  it ('Should return an object alt score of 0', () => {
    expect(scores['object-alt'].score).toBe(0);
  });

  it ('Should return a tabindex score of 0', () => {
    expect(scores['tabindex'].score).toBe(0);
  });

  it ('Should return a td headers attr score of 0', () => {
    expect(scores['td-headers-attr'].score).toBe(0);
  });

  it ('Should return a th has data cells score of 0', () => {
    expect(scores['th-has-data-cells'].score).toBe(0);
  });
  
  it ('Should return a valid lang score of 0', () => {
    expect(scores['valid-lang'].score).toBe(0);
  });
    
  it ('Should return a video caption score of 0', () => {
    expect(scores['video-caption'].score).toBe(0);
  });
    
  it ('Should return a video description score of 0', () => {
    expect(scores['video-description'].score).toBe(0);
  });
    
  it ('Should return a logical tab order score of 0', () => {
    expect(scores['logical-tab-order'].score).toBe(0);
  });

  it ('Should return a focusable controls score of 0', () => {
    expect(scores['focusable-controls'].score).toBe(0);
  });

  it ('Should return an interactive element affordance score of 0', () => {
    expect(scores['interactive-element-affordance'].score).toBe(0);
  });
    
  it ('Should return a managed focus score of 0', () => {
    expect(scores['managed-focus'].score).toBe(0);
  });
  
  it ('Should return a focus traps score of 0', () => {
    expect(scores['focus-traps'].score).toBe(0);
  });
    
  it ('Should return a custom controls labels score of 0', () => {
    expect(scores['custom-controls-labels'].score).toBe(0);
  });
    
  it ('Should return a custom controls roles score of 0', () => {
    expect(scores['custom-controls-roles'].score).toBe(0);
  });
    
  it ('Should return a visual order follows dom score of 0', () => {
    expect(scores['visual-order-follows-dom'].score).toBe(0);
  });
  
  it ('Should return an offscreen content hidden score of 0', () => {
    expect(scores['offscreen-content-hidden'].score).toBe(0);
  });
    
  it ('Should return a heading levels score of 0', () => {
    expect(scores['heading-levels'].score).toBe(0);
  });
    
  it ('Should return a use landmarks score of 0', () => {
    expect(scores['use-landmarks'].score).toBe(0);
  })
});

afterAll(async () => {

});