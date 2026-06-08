import { Box, useMantineTheme } from '@mantine/core';

interface InterviewerAvatarProps {
  size?: number;
}

/** Ícone Sparkles inline — evita dependência de lib de ícones. */
function SparklesIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
      <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
      <path d="M5 15l.6 1.5 1.5.6-1.5.6L5 19.8l-.6-1.5L2.9 17.7l1.5-.6z" />
    </svg>
  );
}

export function InterviewerAvatar({ size = 36 }: InterviewerAvatarProps) {
  const theme = useMantineTheme();
  return (
    <Box
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        color: 'var(--mantine-color-white)',
        background: `linear-gradient(135deg, ${theme.colors.terracotta[5]}, ${theme.colors.terracotta[6]} 55%, #1c1813)`,
        boxShadow: '0 0 0 2px #fff, 0 3px 10px rgba(207,85,48,.4)',
      }}
    >
      <SparklesIcon size={Math.round(size * 0.5)} />
    </Box>
  );
}
