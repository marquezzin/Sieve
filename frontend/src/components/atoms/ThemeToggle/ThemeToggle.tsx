import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { Moon, Sun } from '@/components/atoms/Icon';

interface ThemeToggleProps {
  size?: number;
}

/**
 * Alterna entre os esquemas de cor light/dark do Mantine (persistido em
 * localStorage pelo próprio Mantine). Mostra lua no light e sol no dark.
 */
export function ThemeToggle({ size = 40 }: ThemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');
  const isDark = computed === 'dark';

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size={size}
      radius={999}
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title="Alternar tema"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </ActionIcon>
  );
}
