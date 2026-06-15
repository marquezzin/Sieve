import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Check } from '@/components/atoms/Icon';
import { ProfileAvatar } from '../../components/ProfileAvatar/ProfileAvatar';
import { PhotoStudioPlaceholder } from '../../components/PhotoStudioPlaceholder/PhotoStudioPlaceholder';
import { useMe } from '../../hooks/useMe';
import { useUpdateMe } from '../../hooks/useUpdateMe';
import type { CandidateProfile, CandidateProfileUpdate } from '../../types';

function PageHeader() {
  return (
    <Box mb={28}>
      <Text fz={11} fw={700} tt="uppercase" c="terracotta.6" mb={6} style={{ letterSpacing: '0.14em' }}>
        Sua conta
      </Text>
      <Title order={1} fz={24} fw={800} c="gray.9" style={{ letterSpacing: '-0.02em' }}>
        Perfil
      </Title>
    </Box>
  );
}

function ProfileForm({ profile }: { profile: CandidateProfile }) {
  const updateMutation = useUpdateMe();

  const form = useForm<CandidateProfileUpdate>({
    mode: 'uncontrolled',
    initialValues: {
      headline: profile.headline,
      location: profile.location,
      phone: profile.phone,
      linkedin_url: profile.linkedin_url,
      github_url: profile.github_url,
    },
  });

  const displayName = profile.full_name || profile.email || 'Sem nome';

  const handleSubmit = (values: CandidateProfileUpdate) => {
    updateMutation.mutate(values, {
      onSuccess: (updated) => {
        // Marca o estado atual como "limpo" — botão volta a desabilitado.
        form.resetDirty({
          headline: updated.headline,
          location: updated.location,
          phone: updated.phone,
          linkedin_url: updated.linkedin_url,
          github_url: updated.github_url,
        });
      },
    });
  };

  const saving = updateMutation.isPending;

  return (
    <Paper withBorder radius="md" p={24}>
      <Group gap="md" wrap="nowrap" pb="lg">
        <ProfileAvatar name={displayName} size={56} />
        <Box miw={0}>
          <Text fz={17} fw={700} c="gray.9">
            {displayName}
          </Text>
          <Text fz={13} c="gray.6">
            {profile.email}
          </Text>
        </Box>
      </Group>
      <Divider mb="lg" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Headline"
            key={form.key('headline')}
            {...form.getInputProps('headline')}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <TextInput
              label="Localização"
              key={form.key('location')}
              {...form.getInputProps('location')}
            />
            <TextInput
              label="Telefone"
              key={form.key('phone')}
              {...form.getInputProps('phone')}
            />
          </SimpleGrid>
          <TextInput
            label="LinkedIn"
            key={form.key('linkedin_url')}
            {...form.getInputProps('linkedin_url')}
          />
          <TextInput
            label="GitHub"
            key={form.key('github_url')}
            {...form.getInputProps('github_url')}
          />

          <Group justify="flex-end" pt={4}>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'terracotta.5', to: 'terracotta.7', deg: 180 }}
              loading={saving}
              disabled={!form.isDirty()}
              leftSection={<Check size={16} />}
            >
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

export function ProfilePage() {
  const meQuery = useMe();

  if (meQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <Center mih="60vh" px="md">
        <Alert color="red" title="Erro ao carregar o perfil" maw={520}>
          {meQuery.error?.message ?? 'Perfil indisponível.'}
        </Alert>
      </Center>
    );
  }

  return (
    <>
      <PageHeader />
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={24} style={{ alignItems: 'start' }}>
        <ProfileForm key={meQuery.data.updated_at} profile={meQuery.data} />
        <PhotoStudioPlaceholder />
      </SimpleGrid>
    </>
  );
}
