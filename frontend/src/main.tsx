import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import {
  Input,
  MantineProvider,
  TextInput,
  Textarea,
  createTheme,
  type MantineColorsTuple,
  type MantineThemeComponent,
} from '@mantine/core';
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

// Fidelidade ao protótipo (`ui.jsx` → `inputCls`): inputs 44px (`h-11`),
// radius 12px (`rounded-xl`), borda `gray.3`, texto 14px, foco terracota.
// Aplicado no nível do tema (via CSS vars do Input) para TODOS os forms herdarem
// o look do protótipo. Usamos `vars` em vez de `styles` para que a variante
// `unstyled` (ex.: ChatComposer) continue sem borda/fundo — ela ignora estas
// vars e zera borda/fundo nas próprias regras.
const inputBaseVars: NonNullable<MantineThemeComponent['vars']> = () => ({
  wrapper: {
    '--input-height': '44px',
    '--input-radius': '12px',
    '--input-bd': 'var(--mantine-color-gray-3)',
    '--input-fz': '14px',
    '--input-bg': 'var(--mantine-color-white)',
  },
});

// Label do protótipo (`Field`): 13px, bold (700), tom `gray.8`, margem 6px.
const inputLabelStyles = {
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--mantine-color-gray-8)',
    marginBottom: 6,
  },
} as const;

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
  components: {
    Input: Input.extend({
      defaultProps: { size: 'md' },
      vars: inputBaseVars,
    }),
    TextInput: TextInput.extend({
      defaultProps: { size: 'md' },
      vars: inputBaseVars,
      styles: inputLabelStyles,
    }),
    Textarea: Textarea.extend({
      defaultProps: { size: 'md' },
      // Textarea cresce com o conteúdo: só radius/borda/tipografia, SEM altura
      // fixa (omitimos `--input-height` pra não quebrar o autosize do composer).
      vars: () => ({
        wrapper: {
          '--input-radius': '12px',
          '--input-bd': 'var(--mantine-color-gray-3)',
          '--input-fz': '14px',
          '--input-bg': 'var(--mantine-color-white)',
        },
      }),
      styles: inputLabelStyles,
    }),
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
