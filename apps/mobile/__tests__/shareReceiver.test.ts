import { ShareReceiver } from '../src/services/sharing/shareReceiver';
import { NativeModules } from 'react-native';

// Mock NativeModules
jest.mock('react-native', () => {
  return {
    Platform: { OS: 'android' },
    NativeModules: {
      ShareModule: {
        getInitialShare: jest.fn(),
      }
    },
    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
    })),
  };
});

describe('shareReceiver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('detects a single URL in TEXT payload', async () => {
    const { ShareModule } = NativeModules;
    (ShareModule.getInitialShare as jest.Mock).mockResolvedValue({
      type: 'TEXT',
      text: 'https://example.com/internship',
      sourcePackage: 'com.telegram'
    });

    const result = await ShareReceiver.getInitialShare();
    expect(result).toEqual({
      type: 'URL',
      url: 'https://example.com/internship',
      text: undefined,
      sourcePackage: 'com.telegram'
    });
  });

  it('keeps TEXT payload if it has more than just a URL', async () => {
    const { ShareModule } = NativeModules;
    (ShareModule.getInitialShare as jest.Mock).mockResolvedValue({
      type: 'TEXT',
      text: 'Check this out: https://example.com/internship',
      sourcePackage: 'com.telegram'
    });

    const result = await ShareReceiver.getInitialShare();
    expect(result).toEqual({
      type: 'TEXT',
      text: 'Check this out: https://example.com/internship',
      sourcePackage: 'com.telegram'
    });
  });

  it('returns IMAGE payload unchanged', async () => {
    const { ShareModule } = NativeModules;
    (ShareModule.getInitialShare as jest.Mock).mockResolvedValue({
      type: 'IMAGE',
      files: [{ uri: 'file://something.jpg', mimeType: 'image/jpeg' }]
    });

    const result = await ShareReceiver.getInitialShare();
    expect(result).toEqual({
      type: 'IMAGE',
      files: [{ uri: 'file://something.jpg', mimeType: 'image/jpeg' }]
    });
  });
});
