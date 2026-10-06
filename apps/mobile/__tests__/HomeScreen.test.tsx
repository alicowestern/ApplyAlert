import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../src/features/home/screens/HomeScreen';

jest.mock('../src/data/hooks/useOpportunityQueries', () => ({
  useSortedOpportunities: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Wrap component with required providers for testing
function renderWithProviders(component: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 44, left: 0, right: 0, bottom: 34 },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}

const mockProps: any = {
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    isFocused: jest.fn(() => true),
  },
  route: {
    key: 'HomeMain',
    name: 'HomeMain',
  },
};

import { useSortedOpportunities } from '../src/data/hooks/useOpportunityQueries';

describe('HomeScreen', () => {
  it('renders empty state when no opportunities exist', () => {
    (useSortedOpportunities as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<HomeScreen {...mockProps} />);
    expect(screen.getByTestId('home-screen')).toBeTruthy();
    expect(screen.getByText('Never lose track of an opportunity again.')).toBeTruthy();
  });

  it('shows Urgent and Upcoming sections when opportunities are present', () => {
    const mockOpportunities = [
      {
        id: '1',
        title: 'Urgent Grant',
        type: 'GRANT',
        status: 'PREPARING',
        deadline: {
          kind: 'EXACT_INSTANT',
          utcInstant: new Date(Date.now() + 86400000).toISOString(),
          confidence: 1,
          userConfirmed: true,
        },
      },
      {
        id: '2',
        title: 'Upcoming Fellowship',
        type: 'FELLOWSHIP',
        status: 'PREPARING',
        deadline: {
          kind: 'EXACT_INSTANT',
          utcInstant: new Date(Date.now() + 30 * 86400000).toISOString(),
          confidence: 1,
          userConfirmed: true,
        },
      },
    ];

    (useSortedOpportunities as jest.Mock).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
    });

    renderWithProviders(<HomeScreen {...mockProps} />);
    expect(screen.getByText('Urgent')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
  });
});
