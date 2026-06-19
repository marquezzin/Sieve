import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Center,
  Group,
  Image,
  Loader,
  Modal,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Alert as AlertIcon,
  Download,
  Maximize,
  Refresh,
  Sparkles,
  Upload,
} from '@/components/atoms/Icon';
import { usePhotoStatus } from '../../hooks/usePhotoStatus';
import { useUploadBasePhoto } from '../../hooks/useUploadBasePhoto';
import { useGeneratePhoto } from '../../hooks/useGeneratePhoto';
import type { PhotoState } from '../../types';

const MAX_BYTES = 5 * 1024 * 1024;

/** Valida tipo e tamanho no client antes de subir (o backend revalida). */
function validateFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Formato inválido. Envie um JPG ou PNG.';
  }
  if (file.size > MAX_BYTES) {
    return 'Arquivo muito grande. O limite é 5 MB.';
  }
  return null;
}

function CardShell({ children }: { children: ReactNode }) {
  return (
    <Paper withBorder radius="md" p={24}>
      <Text
        fz={15}
        fw={700}
        mb={4}
        c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
      >
        Foto profissional
      </Text>
      <Text fz={13} c="dimmed" mb="lg">
        Gere uma foto estilo LinkedIn a partir de uma selfie.
      </Text>
      {children}
    </Paper>
  );
}

function UploadDropzone({
  onSelect,
  loading,
}: {
  onSelect: (file: File) => void;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    if (!loading) handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-disabled={loading}
      onClick={() => !loading && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !loading) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!loading) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      py={56}
      px={24}
      style={{
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        borderRadius: 16,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 150ms',
        border: drag
          ? '2px dashed var(--mantine-color-terracotta-4)'
          : '2px dashed light-dark(var(--mantine-color-gray-3), rgba(255, 255, 255, 0.15))',
        background: drag
          ? 'light-dark(var(--mantine-color-terracotta-0), rgba(207, 85, 48, 0.12))'
          : undefined,
        opacity: loading ? 0.7 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
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
            background:
              'light-dark(var(--mantine-color-terracotta-0), rgba(207, 85, 48, 0.16))',
          }}
        >
          {loading ? (
            <Loader size="sm" color="terracotta" />
          ) : (
            <Upload size={26} />
          )}
        </Box>
        <Text
          fz={14}
          fw={700}
          c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
        >
          {loading ? 'Enviando…' : 'Arraste uma selfie ou clique para enviar'}
        </Text>
        <Text fz={12.5} c="dimmed">
          JPG ou PNG · até 5 MB · rosto bem iluminado e centralizado
        </Text>
      </Stack>
    </Box>
  );
}

function PhotoSquare({
  src,
  alt,
  accent,
  onZoom,
}: {
  src: string;
  alt: string;
  accent?: boolean;
  onZoom?: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <Box
      pos="relative"
      w="100%"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onZoom}
      style={{ cursor: onZoom ? 'zoom-in' : undefined }}
    >
      <Image
        src={src}
        alt={alt}
        radius="md"
        style={{
          aspectRatio: '1 / 1',
          objectFit: 'cover',
          width: '100%',
          border: accent
            ? '2px solid var(--mantine-color-terracotta-3)'
            : '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4))',
        }}
      />
      {onZoom && (
        <ActionIcon
          variant="white"
          color="dark"
          radius="xl"
          size="lg"
          aria-label="Ampliar foto"
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            opacity: hover ? 1 : 0,
            transition: 'opacity 150ms',
            boxShadow: '0 1px 6px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Maximize size={16} />
        </ActionIcon>
      )}
    </Box>
  );
}

function GeneratingPhase() {
  return (
    <Stack align="center" gap={4} py={40}>
      <Box
        c="white"
        mb="md"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 64,
          height: 64,
          borderRadius: 16,
          background:
            'linear-gradient(135deg, var(--mantine-color-terracotta-5), var(--mantine-color-terracotta-8))',
        }}
      >
        <Sparkles size={28} />
      </Box>
      <Text
        fz={15}
        fw={700}
        c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
      >
        Gerando sua foto…
      </Text>
      <Text fz={13} c="dimmed" ta="center" maw={320}>
        Isso leva de 15 a 30 segundos (a primeira geração do dia pode demorar um
        pouco mais).
      </Text>
      <Progress value={100} animated color="terracotta" radius="xl" w={192} mt="md" />
    </Stack>
  );
}

export function PhotoStudio() {
  const statusQuery = usePhotoStatus();
  const uploadMutation = useUploadBasePhoto();
  const generateMutation = useGeneratePhoto();
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  const state: PhotoState | undefined = statusQuery.data;
  const status = state?.photo_status;

  const handleSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      notifications.show({ color: 'red', title: 'Foto inválida', message: error });
      return;
    }
    uploadMutation.mutate(file);
  };

  const downloadProfessional = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'foto-profissional.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  let content: ReactNode;

  if (statusQuery.isLoading) {
    // Estado inicial sendo carregado.
    content = (
      <Center py={56}>
        <Loader color="terracotta" />
      </Center>
    );
  } else if (status === 'generating') {
    // Fase generating — sem botões, polling em andamento.
    content = <GeneratingPhase />;
  } else if (
    status === 'ready' &&
    state?.professional_photo_url &&
    state.base_photo_url
  ) {
    // Fase result — antes/depois + ações.
    const professionalUrl = state.professional_photo_url;
    const baseUrl = state.base_photo_url;
    content = (
      <>
        <SimpleGrid cols={2} spacing="sm">
          <Stack gap={8}>
            <Text
              fz={11}
              fw={700}
              tt="uppercase"
              ta="center"
              c="dimmed"
              style={{ letterSpacing: '0.06em' }}
            >
              Antes
            </Text>
            <PhotoSquare
              src={baseUrl}
              alt="Selfie original"
              onZoom={() => setZoom({ src: baseUrl, alt: 'Selfie original' })}
            />
          </Stack>
          <Stack gap={8}>
            <Text
              fz={11}
              fw={700}
              tt="uppercase"
              ta="center"
              c="terracotta.6"
              style={{ letterSpacing: '0.06em' }}
            >
              Depois
            </Text>
            <PhotoSquare
              src={professionalUrl}
              alt="Foto profissional"
              accent
              onZoom={() =>
                setZoom({ src: professionalUrl, alt: 'Foto profissional' })
              }
            />
          </Stack>
        </SimpleGrid>
        <Group justify="center" gap="sm" mt="lg">
          <Button
            variant="default"
            leftSection={<Upload size={16} />}
            loading={uploadMutation.isPending}
            onClick={() => replaceInputRef.current?.click()}
          >
            Trocar foto
          </Button>
          <Button
            variant="default"
            leftSection={<Refresh size={16} />}
            loading={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            Gerar de novo
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'terracotta.5', to: 'terracotta.7', deg: 180 }}
            leftSection={<Download size={16} />}
            onClick={() => downloadProfessional(professionalUrl)}
          >
            Baixar
          </Button>
        </Group>
      </>
    );
  } else if (state?.base_photo_url) {
    // Fase preview — tem base_photo_url e status idle/failed.
    const baseUrl = state.base_photo_url;
    content = (
      <>
        {status === 'failed' && (
          <Alert
            color="red"
            variant="light"
            radius="md"
            mb="md"
            icon={<AlertIcon size={18} />}
          >
            Não consegui gerar. Tente de novo.
          </Alert>
        )}
        <Center>
          <Box maw={240} w="100%">
            <PhotoSquare
              src={baseUrl}
              alt="Selfie enviada"
              onZoom={() => setZoom({ src: baseUrl, alt: 'Selfie enviada' })}
            />
          </Box>
        </Center>
        <Group justify="center" gap="sm" mt="lg">
          <Button
            variant="default"
            loading={uploadMutation.isPending}
            onClick={() => replaceInputRef.current?.click()}
          >
            Trocar foto
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'terracotta.5', to: 'terracotta.7', deg: 180 }}
            leftSection={<Sparkles size={16} />}
            loading={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            Gerar foto profissional
          </Button>
        </Group>
      </>
    );
  } else {
    // Fase upload — sem base_photo_url.
    content = (
      <UploadDropzone onSelect={handleSelect} loading={uploadMutation.isPending} />
    );
  }

  return (
    <CardShell>
      {content}
      {/* Input único de "Trocar foto", compartilhado por preview e result. */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleSelect(file);
        }}
      />
      <Modal
        opened={zoom !== null}
        onClose={() => setZoom(null)}
        size="lg"
        centered
        padding="md"
        title={zoom?.alt}
      >
        {zoom && (
          <Image
            src={zoom.src}
            alt={zoom.alt}
            radius="md"
            fit="contain"
            style={{ maxHeight: '75vh', width: '100%' }}
          />
        )}
      </Modal>
    </CardShell>
  );
}
