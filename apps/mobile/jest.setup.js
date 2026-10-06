// Mock react-native-mmkv for Jest environment
jest.mock('react-native-mmkv', () => {
  return {
    createMMKV: jest.fn(() => {
      let store: Record<string, string> = {};
      return {
        set: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        getString: jest.fn((key: string) => {
          return store[key] || undefined;
        }),
        clearAll: jest.fn(() => {
          store = {};
        }),
      };
    }),
  };
});

// Mock @notifee/react-native for Jest environment
jest.mock('@notifee/react-native', () => ({
  displayNotification: jest.fn(),
  createTriggerNotification: jest.fn(),
  cancelNotification: jest.fn(),
  cancelTriggerNotification: jest.fn(),
  getTriggerNotificationIds: jest.fn().mockResolvedValue([]),
  requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  TriggerType: { TIMESTAMP: 0 },
}));
