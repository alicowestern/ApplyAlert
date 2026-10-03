import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../src/features/home/screens/HomeScreen';

// Wrap component with required providers for testing
function renderWithProviders(component: React.ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 44, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </SafeAreaProvider>,
  );
}

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    renderWithProviders(<HomeScreen />);
    expect(screen.getByTestId('home-screen')).toBeTruthy();
  });

  it('displays the app name', () => {
    renderWithProviders(<HomeScreen />);
    expect(screen.getByText('ApplyAlert')).toBeTruthy();
  });

  it('shows Urgent and Upcoming sections', () => {
    renderWithProviders(<HomeScreen />);
    expect(screen.getByText('Urgent')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
  });
});
