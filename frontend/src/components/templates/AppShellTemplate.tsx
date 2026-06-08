import type { ReactNode } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { AppShell, Anchor, Button, Group, Title } from '@mantine/core';
import { useLogout } from '@/domains/auth';

interface AppShellTemplateProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', end: true },
  { to: '/healthcheck', label: 'Healthcheck' },
  { to: '/chat', label: 'Chat' },
];

export function AppShellTemplate({ children }: AppShellTemplateProps) {
  const logout = useLogout();

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xl" wrap="nowrap">
            <Title order={4}>Sieve</Title>
            <Group gap="md" wrap="nowrap">
              {NAV_ITEMS.map((item) => (
                <Anchor
                  key={item.to}
                  component={RouterNavLink}
                  to={item.to}
                  end={item.end}
                  fw={600}
                  c="dimmed"
                  underline="never"
                  // NavLink injeta a classe `active` no link da rota corrente.
                  style={({ isActive }: { isActive: boolean }) =>
                    isActive
                      ? { color: 'var(--mantine-color-terracotta-7)' }
                      : undefined
                  }
                >
                  {item.label}
                </Anchor>
              ))}
            </Group>
          </Group>
          <Button variant="subtle" onClick={logout}>
            Sair
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
