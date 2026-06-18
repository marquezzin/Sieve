import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import {
  ColorSchemeScript,
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
import { DatesProvider } from '@mantine/dates';
import { QueryClientProvider } from '@tanstack/react-query';
import 'dayjs/locale/pt-br';
import { router } from './router';
import { queryClient } from './lib/queryClient';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
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

// Tupla `dark` quente (espresso) — fiel ao tema dark do protótipo
// (`html.theme-dark` em prototipo/index.html). Mantine usa, no dark scheme:
//   7 = body bg (#16120e), 6 = surface/cards (#211c16), 5 = hover,
//   4/3 = bordas, 2 = dimmed (#c6bbab), 0 = texto (#f4eee4).
// Os índices intermediários interpolam entre superfície e texto pra manter o
// tom marrom-quente em vez do azulado padrão do Mantine.
const dark: MantineColorsTuple = [
  '#f4eee4', // 0 — texto principal
  '#e0d6c8', // 1
  '#c6bbab', // 2 — dimmed
  '#8c8271', // 3 — borda forte / placeholder
  '#574f43', // 4 — borda
  '#3a332b', // 5 — hover / superfície elevada
  '#211c16', // 6 — surface / cards
  '#16120e', // 7 — body / canvas
  '#120f0b', // 8
  '#0d0a07', // 9
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
    '--input-bd': 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
    '--input-fz': '14px',
    '--input-bg': 'light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))',
  },
});

// Label do protótipo (`Field`): 13px, bold (700), tom `gray.8`, margem 6px.
const inputLabelStyles = {
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: 'light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark-1))',
    marginBottom: 6,
  },
} as const;

// A superfície de card (Paper/Card branco no light / dark-6 no dark sobre o
// canvas creme/dark-7) é tratada em `styles/global.css` via `:where(...)`
// (especificidade zero) — NÃO via `styles.root` do tema. Motivo: `styles.root`
// injeta `background-color` INLINE, que sobrepõe qualquer fundo próprio de um
// card (gradiente do banner de conclusão, bolha terracota do chat, tints por
// className), "lavando" tudo de branco. O seletor `:where()` deixa esses
// classNames vencerem trivialmente, mantendo o card padrão branco/dark-6.

const theme = createTheme({
  primaryColor: 'terracotta',
  colors: { terracotta, gray, dark },
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
          '--input-bd': 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
          '--input-fz': '14px',
          '--input-bg': 'light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))',
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
    <ColorSchemeScript defaultColorScheme="light" />
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0 }}>
        <ModalsProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
);
