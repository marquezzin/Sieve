import {
  Alert,
  Box,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLogin } from '../../hooks/useLogin';
import classes from './LoginPage.module.css';

interface LoginFormValues {
  username: string;
  password: string;
}

const STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '7', label: 'fases de entrevista' },
  { value: '0–10', label: 'nota do currículo' },
  { value: 'ATS', label: 'otimização' },
];

function SieveMark({ size = 19 }: { size?: number }) {
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
      aria-hidden="true"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function UserIcon({ size = 16 }: { size?: number }) {
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
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon({ size = 16 }: { size?: number }) {
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
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function LoginPage() {
  const loginMutation = useLogin();
  const form = useForm<LoginFormValues>({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (v.trim().length === 0 ? 'Informe o usuário' : null),
      password: (v) => (v.length === 0 ? 'Informe a senha' : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <Box className={classes.root}>
      <Box className={classes.brand} visibleFrom="lg">
        <Box className={`${classes.blob} ${classes.blobTop}`} />
        <Box className={`${classes.blob} ${classes.blobBottom}`} />

        <Group gap="sm" className={classes.brandContent}>
          <Box className={`${classes.logoMark} ${classes.logoMarkBrand}`}>
            <SieveMark />
          </Box>
          <Text fw={800} fz={22} ff="heading">
            Sieve
          </Text>
        </Group>

        <Box className={classes.brandContent}>
          <Title order={2} fw={800} fz={34} lh={1.1}>
            Seu currículo profissional, construído por conversa.
          </Title>
          <Text mt="md" fz="md" maw={360} c="terracotta.0">
            Um entrevistador por IA conduz, um time de agentes redige e avalia, e
            você acompanha cada candidatura — tudo em um só lugar.
          </Text>
          <Group gap={40} mt={32}>
            {STATS.map((stat) => (
              <Box key={stat.label}>
                <Text ff="monospace" fw={600} fz={24} lh={1}>
                  {stat.value}
                </Text>
                <Text mt={4} fz={12} c="terracotta.0">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Group>
        </Box>

        <Text className={classes.brandContent} fz={12} c="terracotta.1">
          © 2026 Sieve · feito para candidatos brasileiros
        </Text>
      </Box>

      <Box className={classes.form}>
        <Box className={classes.formInner}>
          <Group gap="sm" justify="center" mb="xl" hiddenFrom="lg">
            <Box className={`${classes.logoMark} ${classes.logoMarkForm}`}>
              <SieveMark />
            </Box>
            <Text fw={800} fz={22} ff="heading">
              Sieve
            </Text>
          </Group>

          <Title order={1} fw={800} fz={26}>
            Entrar na sua conta
          </Title>
          <Text mt={6} fz="sm" c="dimmed">
            Bem-vindo de volta! Continue construindo sua carreira.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack mt="lg" gap="md">
              {loginMutation.isError && (
                <Alert color="red" title="Credenciais inválidas" variant="light">
                  Verifique seu usuário e senha e tente novamente.
                </Alert>
              )}

              <TextInput
                label="Usuário"
                placeholder="seu.usuario"
                size="md"
                leftSection={<UserIcon />}
                autoComplete="username"
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label="Senha"
                placeholder="••••••••"
                size="md"
                leftSection={<LockIcon />}
                autoComplete="current-password"
                {...form.getInputProps('password')}
              />
              <Button
                type="submit"
                size="md"
                fullWidth
                mt="xs"
                loading={loginMutation.isPending}
              >
                Entrar
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
