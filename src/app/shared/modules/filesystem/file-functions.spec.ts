import { LearningObject } from '@entity';
import { getPreviewUrl } from './file-functions';

describe('getPreviewUrl', () => {
  let validFile: LearningObject.Material.File;
  let invalidFile: LearningObject.Material.File;
  beforeAll(() => {
    validFile = {
      id: null,
      name: null,
      fileType: null,
      extension: '.odt',
      url: 'https://fakesite.com/nothing',
      date: null,
    };
    invalidFile = {
      id: null,
      name: null,
      fileType: null,
      extension: '.vmdk',
      url: 'https://fakesite.com/avmfile',
      date: null,
    };
  });

  it('should return the URL', () => {
    const URL = getPreviewUrl(validFile);
    expect(URL !== '').toBeTruthy();
  });

  it('should return an empty string', () => {
    const URL = getPreviewUrl(invalidFile);
    expect(URL).toEqual('');
  });
});
