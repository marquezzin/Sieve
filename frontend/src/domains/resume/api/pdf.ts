import { apiClient } from '@/domains/auth/api/client';

/**
 * Baixa o PDF de uma versão e dispara o download no navegador.
 *
 * O endpoint devolve `application/pdf` cru (não envelope) — o guard
 * `responseType === 'blob'` no interceptor de `apiClient` impede o desembrulho.
 */
export async function downloadVersionPdf(
  id: string,
  versionNumber: number,
): Promise<void> {
  const response = await apiClient.get<Blob>(
    `/v1/resumes/${id}/versions/${versionNumber}/pdf/`,
    { responseType: 'blob' },
  );

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-${id}-v${versionNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
