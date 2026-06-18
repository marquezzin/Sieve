import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ExportArgs {
  /** Nó DOM do card de preview a capturar. */
  node: HTMLElement;
  /** Nome base do arquivo (sem extensão). */
  filename: string;
}

/**
 * Exporta o **modelo visual**: uma **cópia exata** do card de preview do Sieve.
 * Captura o nó renderizado (fontes + IDV terracota reais) como imagem e monta um
 * PDF A4, paginando se o currículo for mais alto que uma página.
 *
 * É raster (imagem), de propósito — o usuário quer o card idêntico à tela. O
 * modelo ATS-safe (texto vetorial selecionável) continua sendo o `useDownloadPdf`.
 */
export function useExportVisualPdf() {
  return useMutation<void, Error, ExportArgs>({
    mutationFn: async ({ node, filename }) => {
      // pixelRatio 2 → nitidez; fundo branco pra não capturar o canvas creme.
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Falha ao processar a imagem.'));
      });

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // Largura cheia da página; altura proporcional ao aspecto da imagem.
      const imgH = (img.height / img.width) * pageW;

      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(dataUrl, 'PNG', 0, position, pageW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pageW, imgH);
        heightLeft -= pageH;
      }

      pdf.save(`${filename}.pdf`);
    },
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'PDF exportado',
        message: 'O modelo visual (igual à tela) foi baixado.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Falha ao exportar',
        message: 'Não consegui capturar o currículo. Tente novamente.',
      });
    },
  });
}
