import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export type Screen = 'Home';

export const Navigation = () => {
  const [screen, setScreen] = useState<Screen>('Home');

  if (screen === 'Home') {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>BudgetPulse</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return null;
};