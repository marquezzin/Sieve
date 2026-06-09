import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useElementSize, useReducedMotion } from '@mantine/hooks';
import { useLogin } from '../../hooks/useLogin';
import { useRegister } from '../../hooks/useRegister';
import classes from './LoginPage.module.css';

type AuthMode = 'login' | 'register';

interface LoginFormValues {
  username: string;
  password: string;
}

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

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

function MailIcon({ size = 16 }: { size?: number }) {
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
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: 'Entrar na sua conta',
    subtitle: 'Bem-vindo de volta! Continue construindo sua carreira.',
  },
  register: {
    title: 'Criar sua conta',
    subtitle: 'Comece a construir seu currículo por conversa.',
  },
};

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const reduceMotion = useReducedMotion();
  // Mede o form ativo pra animar a altura do container na troca (login=2
  // campos, cadastro=4) — sem isso a troca dá um "salto" de altura.
  const { ref: layerRef, height } = useElementSize();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const form = useForm<LoginFormValues>({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (v.trim().length === 0 ? 'Informe o usuário' : null),
      password: (v) => (v.length === 0 ? 'Informe a senha' : null),
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    initialValues: { username: '', email: '', password: '', confirm: '' },
    validate: {
      username: (v) => (v.trim().length === 0 ? 'Informe o usuário' : null),
      email: (v) => (EMAIL_RE.test(v.trim()) ? null : 'Informe um e-mail válido'),
      password: (v) => (v.length < 8 ? 'A senha deve ter no mínimo 8 caracteres' : null),
      confirm: (v, values) => (v !== values.password ? 'As senhas não conferem' : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    loginMutation.mutate(values);
  });

  const handleRegisterSubmit = registerForm.onSubmit((values) => {
    registerMutation.mutate({
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
    });
  });

  const copy = COPY[mode];

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

          <SegmentedControl
            fullWidth
            color="terracotta"
            radius="md"
            value={mode}
            onChange={(value) => setMode(value as AuthMode)}
            data={[
              { label: 'Entrar', value: 'login' },
              { label: 'Cadastre-se', value: 'register' },
            ]}
            mb="lg"
          />

          <Title order={1} fw={800} fz={26}>
            {copy.title}
          </Title>
          <Text mt={6} fz="sm" c="dimmed">
            {copy.subtitle}
          </Text>

          <Box
            mt="lg"
            className={classes.formSwap}
            style={{
              height: height || undefined,
              transition: reduceMotion
                ? undefined
                : 'height 240ms cubic-bezier(.2,.7,.3,1)',
            }}
          >
            <Box
              ref={layerRef}
              key={mode}
              className={classes.formLayer}
              data-animate={reduceMotion ? undefined : 'true'}
            >
              {mode === 'login' ? (
                <form onSubmit={handleSubmit}>
                  <Stack gap="md">
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
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <Stack gap="md">
                    {registerMutation.isError && (
                      <Alert color="red" title="Não foi possível cadastrar" variant="light">
                        {registerMutation.error?.message}
                      </Alert>
                    )}

                    <TextInput
                      label="Usuário"
                      placeholder="seu.usuario"
                      size="md"
                      leftSection={<UserIcon />}
                      autoComplete="username"
                      {...registerForm.getInputProps('username')}
                    />
                    <TextInput
                      label="E-mail"
                      placeholder="voce@exemplo.com"
                      size="md"
                      leftSection={<MailIcon />}
                      autoComplete="email"
                      {...registerForm.getInputProps('email')}
                    />
                    <PasswordInput
                      label="Senha"
                      placeholder="••••••••"
                      size="md"
                      leftSection={<LockIcon />}
                      autoComplete="new-password"
                      {...registerForm.getInputProps('password')}
                    />
                    <PasswordInput
                      label="Confirmar senha"
                      placeholder="••••••••"
                      size="md"
                      leftSection={<LockIcon />}
                      autoComplete="new-password"
                      {...registerForm.getInputProps('confirm')}
                    />
                    <Button
                      type="submit"
                      size="md"
                      fullWidth
                      mt="xs"
                      loading={registerMutation.isPending}
                    >
                      Criar conta
                    </Button>
                  </Stack>
                </form>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
