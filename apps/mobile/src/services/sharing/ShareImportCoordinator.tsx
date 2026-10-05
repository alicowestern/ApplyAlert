import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ShareReceiver } from './shareReceiver';
import type { SharedContent } from './types';

export function ShareImportCoordinator() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const handleShare = (content: SharedContent) => {
      navigation.navigate('AddOpportunity', {
        screen: 'SharePreview',
        params: { sharedContent: content },
      });
    };

    // Check for initial intent (cold start)
    ShareReceiver.getInitialShare().then((content) => {
      if (content) {
        handleShare(content);
      }
    });

    // Listen for intents while app is running (warm start)
    const unsubscribe = ShareReceiver.onShareReceived((content) => {
      handleShare(content);
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  return null; // This is a logic-only component
}
