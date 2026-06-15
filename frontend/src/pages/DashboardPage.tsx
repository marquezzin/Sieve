import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Center mih="60vh">
      <Stack align="center" gap="md" maw={520}>
        <Title order={1} ta="center">
          Bem-vindo ao Sieve
        </Title>
        <Text c="dimmed" ta="center">
          Comece uma entrevista com o agente para coletar os dados do seu
          currículo.
        </Text>
        <Button variant="light" onClick={() => navigate('/chat')}>
          Iniciar entrevista
        </Button>
      </Stack>
    </Center>
  );
}
