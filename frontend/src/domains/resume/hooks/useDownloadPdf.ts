import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { downloadVersionPdf } from '../api/pdf';

interface DownloadArgs {
  id: string;
  versionNumber: number;
}

/** Baixa o PDF ATS (modelo padrão, gerado no backend); notifica sucesso/erro. */
export function useDownloadPdf() {
  return useMutation<void, Error, DownloadArgs>({
    mutationFn: ({ id, versionNumber }) =>
      downloadVersionPdf(id, versionNumber),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'PDF exportado',
        message: 'Seu currículo ATS foi baixado.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Falha ao exportar',
        message: 'Não consegui gerar o PDF. Tente novamente.',
      });
    },
  });
}
