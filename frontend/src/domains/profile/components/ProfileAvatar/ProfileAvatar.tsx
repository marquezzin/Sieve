import { Box } from '@mantine/core';

interface ProfileAvatarProps {
  name: string;
  size?: number;
}

function initialsOf(name: string): string {
  const parts = name.split(' ').filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((w) => w[0]).join('').toUpperCase();
}

/** Avatar com iniciais + gradiente terracota do protótipo (ui.jsx `Avatar`). */
export function ProfileAvatar({ name, size = 56 }: ProfileAvatarProps) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: size,
        height: size,
        fontSize: size * 0.36,
        fontWeight: 700,
        color: 'var(--mantine-color-white)',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #e07c52, #b8451f)',
        boxShadow: '0 0 0 2px #fff, 0 1px 3px rgba(0,0,0,.12)',
      }}
    >
      {initialsOf(name)}
    </Box>
  );
}
