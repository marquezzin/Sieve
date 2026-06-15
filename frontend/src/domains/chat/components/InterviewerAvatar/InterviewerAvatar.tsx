import { Box, useMantineTheme } from '@mantine/core';
import { SparklesIcon } from '../sparkles';

interface InterviewerAvatarProps {
  size?: number;
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
