import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { clusterApiUrl } from '@solana/web3.js';
import { MobileWalletProvider } from '@wallet-ui/react-native-web3js';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  selectOnboardingSeen,
  selectSessionHydrated,
  useSessionStore,
} from '@/lib/store/sessionStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

const chain = 'solana:devnet';
const endpoint = clusterApiUrl('devnet');
const identity = {
  name: 'Cryptonaire',
  uri: 'https://cryptonaire.app',
  icon: 'favicon.png',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isHydrated = useSessionStore(selectSessionHydrated);
  const onboardingSeen = useSessionStore(selectOnboardingSeen);
  const hydrate = useSessionStore((s) => s.hydrate);

  // Load session flags from SecureStore on first mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Don't render until SecureStore is read
  if (!isHydrated) return null;

  return (
    <MobileWalletProvider chain={chain} endpoint={endpoint} identity={identity}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Onboarding – shown only on first launch */}
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>

        {/* Redirect first-time users to onboarding */}
        {!onboardingSeen && <Redirect href="/onboarding" />}

        <StatusBar style="auto" />
      </ThemeProvider>
    </MobileWalletProvider>
  );
}

