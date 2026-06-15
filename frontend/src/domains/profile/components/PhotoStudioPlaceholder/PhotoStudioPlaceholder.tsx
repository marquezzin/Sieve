import { Badge, Box, Group, Paper, Stack, Text } from '@mantine/core';
import { Upload } from '@/components/atoms/Icon';

/**
 * Placeholder fiel ao `PhotoStudio` do protótipo (estado `upload`), porém INERTE.
 * A geração de foto profissional é Fase 4. Mantém o chrome (SectionLabel +
 * subtítulo + dropzone tracejada) mas sem interação.
 */
export function PhotoStudioPlaceholder() {
  return (
    <Paper withBorder radius="md" p={24}>
      <Group justify="space-between" align="center" mb={4} wrap="nowrap">
        <Text fz={15} fw={700} c="gray.9">
          Foto profissional
        </Text>
        <Badge color="terracotta" variant="light" radius="sm">
          Em breve · Fase 4
        </Badge>
      </Group>
      <Text fz={13} c="gray.6" mb="lg">
        Gere uma foto estilo LinkedIn a partir de uma selfie.
      </Text>

      <Box
        aria-disabled
        py={56}
        px={24}
        style={{
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          borderRadius: 16,
          border: '2px dashed var(--mantine-color-gray-3)',
          opacity: 0.7,
          cursor: 'not-allowed',
        }}
      >
        <Stack align="center" gap={4}>
          <Box
            c="terracotta.6"
            mb="md"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--mantine-color-terracotta-0)',
            }}
          >
            <Upload size={26} />
          </Box>
          <Text fz={14} fw={700} c="gray.9">
            Arraste uma selfie ou clique para enviar
          </Text>
          <Text fz={12.5} c="gray.5">
            JPG ou PNG · até 5 MB · rosto bem iluminado e centralizado
          </Text>
        </Stack>
      </Box>
    </Paper>
  );
}
