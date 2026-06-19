import { useMutation } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/lib/notifications';
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
      notifySuccess('PDF exportado', 'Seu currículo ATS foi baixado.');
    },
    onError: () => {
      notifyError('Falha ao exportar', 'Não consegui gerar o PDF. Tente novamente.');
    },
  });
}
