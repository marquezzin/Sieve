import { notifications } from '@mantine/notifications';

/**
 * Helpers finos sobre `notifications.show` que padronizam cor/forma das
 * notificações do app. As mensagens continuam em pt-BR no call-site.
 *
 * - `notifySuccess` → verde (mutation concluída com sucesso).
 * - `notifyError`   → vermelho (falha de query/mutation).
 * - `notifyInfo`    → azul (aviso neutro / progresso).
 *
 * Casos com customização especial (ícone, autoClose, loading) podem seguir
 * chamando `notifications.show` direto.
 */
export function notifySuccess(title: string, message?: string) {
  notifications.show({ color: 'green', title, message });
}

export function notifyError(title: string, message?: string) {
  notifications.show({ color: 'red', title, message });
}

export function notifyInfo(title: string, message?: string) {
  notifications.show({ color: 'blue', title, message });
}
