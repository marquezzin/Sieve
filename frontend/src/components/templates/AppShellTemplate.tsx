import type { ComponentType, ReactNode } from 'react';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Group,
  Indicator,
  Menu,
  ScrollArea,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useLogout } from '@/domains/auth';
import {
  Bell,
  Briefcase,
  Chat,
  File,
  Home,
  type IconProps,
  Kanban,
  LogOut,
  Menu as MenuIcon,
  Search,
  Settings,
  Sparkles,
  User,
} from '@/components/atoms/Icon';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import sieveLogo from '@/assets/sieve-logo.png';

interface AppShellTemplateProps {
  children: ReactNode;
}

type IconComponent = ComponentType<IconProps>;

interface NavItem {
  label: string;
  icon: IconComponent;
  to?: string;
  end?: boolean;
  tag?: string;
  count?: number;
  soon?: boolean;
}

// Itens reais navegam; itens `soon` são placeholders desabilitados.
const NAV_ITEMS: NavItem[] = [
  { label: 'Início', icon: Home, to: '/', end: true },
  { label: 'Chat', icon: Chat, to: '/chat', tag: 'IA' },
  { label: 'Currículos', icon: File, to: '/resumes' },
  { label: 'Vagas', icon: Briefcase, to: '/matching' },
  { label: 'Candidaturas', icon: Kanban, count: 5, soon: true },
  { label: 'Perfil', icon: User, to: '/profile' },
];

// Header translúcido — cream no light, espresso no dark (espelha
// `.bg-cream/90` do protótipo).
const HEADER_BG = 'light-dark(rgba(250, 247, 242, 0.9), rgba(28, 23, 18, 0.82))';

function Logo() {
  return (
    <Group gap={10} wrap="nowrap" style={{ userSelect: 'none' }}>
      <Box
        component="img"
        src={sieveLogo}
        alt="Sieve"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          flexShrink: 0,
          objectFit: 'cover',
          boxShadow:
            '0 2px 8px rgba(207,85,48,.45), inset 0 1px 0 rgba(255,255,255,.25)',
        }}
      />
      <Title
        order={3}
        fw={800}
        c="var(--mantine-color-text)"
        style={{ fontSize: 20, letterSpacing: '-0.02em' }}
      >
        Sieve
      </Title>
    </Group>
  );
}

// Pílula de busca — puramente decorativa (sem ação, sem foco).
function SearchPill() {
  return (
    <Box
      aria-disabled
      visibleFrom="md"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        borderRadius: 999,
        backgroundColor: 'light-dark(#fff, var(--mantine-color-dark-6))',
        border: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
        boxShadow: '0 1px 2px rgba(60,42,28,.05), 0 2px 6px -1px rgba(60,42,28,.05)',
        paddingLeft: 20,
        paddingRight: 8,
        cursor: 'default',
      }}
    >
      <Text fz={14} fw={700} c="var(--mantine-color-text)">
        Buscar
      </Text>
      <Box
        style={{
          width: 1,
          height: 20,
          backgroundColor: 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
          margin: '0 14px',
        }}
      />
      <Text fz={13.5} fw={500} c="dimmed">
        vagas, currículos, candidaturas…
      </Text>
      <Box
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 32,
          height: 32,
          borderRadius: 999,
          marginLeft: 14,
          color: '#fff',
          background:
            'linear-gradient(180deg, var(--mantine-color-terracotta-5), var(--mantine-color-terracotta-7))',
        }}
      >
        <Search size={15} />
      </Box>
    </Box>
  );
}

function UserAvatar({ size = 30 }: { size?: number }) {
  return (
    <Box
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: 999,
        color: '#fff',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #e07c52, #b8451f)',
      }}
    >
      <User size={size * 0.5} />
    </Box>
  );
}

// Item de nav no estilo "Airbnb category": ícone empilhado + label + underline.
function TopNavItem({ item }: { item: NavItem }) {
  const iconNode = (
    <Box pos="relative" style={{ display: 'flex', lineHeight: 0 }}>
      <item.icon size={21} />
      {item.count != null && (
        <Badge
          size="xs"
          circle
          color="terracotta"
          pos="absolute"
          style={{ top: -6, right: -10, border: '2px solid var(--mantine-color-body)' }}
        >
          {item.count}
        </Badge>
      )}
    </Box>
  );

  const labelNode = (
    <Group gap={4} wrap="nowrap">
      <Text fz={12} fw={700} lh={1} style={{ whiteSpace: 'nowrap' }}>
        {item.label}
      </Text>
      {item.tag && (
        <Badge size="xs" variant="light" color="terracotta">
          {item.tag}
        </Badge>
      )}
      {item.soon && (
        <Badge size="xs" variant="light" color="gray">
          em breve
        </Badge>
      )}
    </Group>
  );

  // Item futuro — esmaecido, não navega.
  if (item.soon || !item.to) {
    return (
      <Box
        aria-disabled
        title="Em breve"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          flexShrink: 0,
          padding: '6px 8px',
          minWidth: 68,
          color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-2))',
          opacity: 0.45,
          cursor: 'default',
        }}
      >
        {iconNode}
        {labelNode}
      </Box>
    );
  }

  return (
    <UnstyledButton
      component={RouterNavLink}
      to={item.to}
      end={item.end}
      style={({ isActive }: { isActive: boolean }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        flexShrink: 0,
        padding: '6px 8px',
        minWidth: 68,
        position: 'relative',
        color: isActive
          ? 'var(--mantine-color-text)'
          : 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))',
        transition: 'color .15s ease',
      })}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {iconNode}
          {labelNode}
          <Box
            style={{
              position: 'absolute',
              left: 8,
              right: 8,
              bottom: -1,
              height: 2.5,
              borderRadius: 999,
              backgroundColor: isActive ? 'var(--mantine-color-text)' : 'transparent',
              transition: 'background-color .15s ease',
            }}
          />
        </>
      )}
    </UnstyledButton>
  );
}

export function AppShellTemplate({ children }: AppShellTemplateProps) {
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <AppShell header={{ height: 132 }} padding="md">
      <AppShell.Header
        style={{
          backgroundColor: HEADER_BG,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom:
            '1px solid light-dark(var(--mantine-color-gray-2), rgba(255,255,255,.1))',
        }}
      >
        {/* Row 1 — logo · busca · usuário */}
        <Group
          h={72}
          px={{ base: 'md', lg: 'xl' }}
          justify="space-between"
          gap="sm"
          wrap="nowrap"
        >
          <Box style={{ flexShrink: 0 }}>
            <Logo />
          </Box>
          <Group justify="center" style={{ flex: 1 }} px="xs" wrap="nowrap">
            <SearchPill />
          </Group>
          <Group gap={10} wrap="nowrap" style={{ flexShrink: 0 }}>
            <UnstyledButton
              visibleFrom="sm"
              onClick={() => navigate('/chat')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 40,
                padding: '0 16px',
                borderRadius: 999,
                fontSize: 13.5,
                fontWeight: 700,
                color: 'var(--mantine-color-text)',
                whiteSpace: 'nowrap',
              }}
            >
              <Box c="terracotta.6" style={{ display: 'grid', placeItems: 'center' }}>
                <Sparkles size={16} />
              </Box>
              Nova entrevista
            </UnstyledButton>

            <ThemeToggle />

            <Indicator color="terracotta" size={8} offset={6} withBorder>
              <ActionIcon
                aria-disabled
                variant="subtle"
                color="gray"
                size={40}
                radius={999}
                style={{ cursor: 'default' }}
              >
                <Bell size={19} />
              </ActionIcon>
            </Indicator>

            <Menu width={240} position="bottom-end" shadow="lg" radius="lg">
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 44,
                    paddingLeft: 12,
                    paddingRight: 6,
                    borderRadius: 999,
                    border:
                      '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
                    backgroundColor:
                      'light-dark(#fff, var(--mantine-color-dark-6))',
                  }}
                >
                  <Box c="dimmed" style={{ display: 'grid', placeItems: 'center' }}>
                    <MenuIcon size={16} />
                  </Box>
                  <UserAvatar />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Minha conta</Menu.Label>
                <Menu.Item
                  leftSection={<User size={17} />}
                  onClick={() => navigate('/profile')}
                >
                  Meu perfil
                </Menu.Item>
                <Menu.Item
                  disabled
                  leftSection={<Settings size={17} />}
                >
                  Configurações
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<LogOut size={17} />}
                  onClick={logout}
                >
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Row 2 — nav horizontal */}
        <Group
          h={56}
          px={{ base: 'md', lg: 'xl' }}
          gap="xs"
          wrap="nowrap"
          align="center"
          style={{
            borderTop:
              '1px solid light-dark(var(--mantine-color-gray-1), rgba(255,255,255,.06))',
          }}
        >
          <ScrollArea
            scrollbars="x"
            type="never"
            style={{ flex: 1 }}
            styles={{ viewport: { paddingBottom: 0 } }}
          >
            <Group gap={4} wrap="nowrap">
              {NAV_ITEMS.map((item) => (
                <TopNavItem key={item.label} item={item} />
              ))}
            </Group>
          </ScrollArea>
        </Group>
      </AppShell.Header>

      {/* `canvas-bg` pinta o glow terracota no topo + a textura pontilhada como
          camadas de background (atrás do conteúdo) — ver styles/global.css. */}
      <AppShell.Main className="canvas-bg">{children}</AppShell.Main>
    </AppShell>
  );
}
