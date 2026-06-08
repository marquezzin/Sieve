import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { MantineProvider, createTheme, type MantineColorsTuple } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from './lib/queryClient';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/global.css';

// Terracota/clay — IDV do Sieve. Acento em torno de #cf5530 (índices 5/6).
const terracotta: MantineColorsTuple = [
  '#fdf3ef',
  '#f6e0d8',
  '#eebfae',
  '#e69c81',
  '#df7e5b',
  '#db6c44',
  '#cf5530',
  '#b8451f',
  '#9c3a1b',
  '#7f2f15',
];

// Neutra quente do protótipo — substitui a escala `gray` cinza do Mantine.
const gray: MantineColorsTuple = [
  '#f8f6f2',
  '#f1ede6',
  '#e8e3d9',
  '#dbd4c7',
  '#c6bdac',
  '#a89e8c',
  '#7d7464',
  '#574f43',
  '#37312a',
  '#221d17',
];

const theme = createTheme({
  primaryColor: 'terracotta',
  colors: { terracotta, gray },
  defaultRadius: 'md',
  fontFamily: '"Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  headings: {
    fontFamily: '"Bricolage Grotesque", "Hanken Grotesk", sans-serif',
    fontWeight: '800',
  },
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>,
);
