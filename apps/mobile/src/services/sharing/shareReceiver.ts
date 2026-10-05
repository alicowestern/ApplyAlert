import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { SharedContent, ShareReceiver as IShareReceiver } from './types';

const { ShareModule } = NativeModules;
const shareEmitter = new NativeEventEmitter(ShareModule);

export const ShareReceiver: IShareReceiver = {
  getInitialShare: async () => {
    if (Platform.OS !== 'android' || !ShareModule) {
      return null;
    }
    try {
      const payload = await ShareModule.getInitialShare();
      return processPayload(payload);
    } catch (e) {
      console.error('Failed to get initial share', e);
      return null;
    }
  },
  onShareReceived: (callback) => {
    if (Platform.OS !== 'android' || !ShareModule) {
      return () => {};
    }
    const subscription = shareEmitter.addListener('onShareReceived', (payload) => {
      const processed = processPayload(payload);
      if (processed) {
        callback(processed);
      }
    });
    return () => {
      subscription.remove();
    };
  }
};

/**
 * Normalizes text to detect URLs, falling back to basic type extraction if it's purely a URL.
 */
function processPayload(payload: any): SharedContent | null {
  if (!payload) return null;
  
  const content = { ...payload } as SharedContent;
  
  if (content.type === 'TEXT' && content.text) {
    const text = content.text.trim();
    // simple heuristic: if it's purely one URL, treat as URL
    const isSingleUrl = /^https?:\/\/\S+$/.test(text);
    if (isSingleUrl) {
      content.type = 'URL';
      content.url = text;
      content.text = undefined;
    }
  }

  return content;
}
