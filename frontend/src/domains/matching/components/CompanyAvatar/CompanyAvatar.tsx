import { Box } from '@mantine/core';
import { Briefcase } from '@/components/atoms/Icon';

/**
 * Paleta de gradientes quentes, todos na mesma família da IDV (terracotta + areia
 * + barro + ferrugem + oliva-queimada). A empresa escolhe um deles de forma
 * determinística (hash do nome), então o avatar é estável entre renders e entre a
 * lista e o detalhe — e a lista fica viva sem virar arco-íris.
 */
const AVATAR_GRADIENTS = [
  ['#e8825a', '#c2410c'], // terracotta
  ['#d8a657', '#9a5b1e'], // âmbar/caramelo
  ['#c6907a', '#7a3b2e'], // barro rosado
  ['#cbb285', '#6f5a32'], // areia/dourado seco
  ['#b9776a', '#8a2f23'], // ferrugem
  ['#a8a06b', '#5c5a2c'], // oliva queimada
  ['#cf9b8a', '#8c4a3a'], // telha clara
  ['#c6bdac', '#574f43'], // neutro quente (gradiente original do protótipo)
] as const;

/** Hash estável (djb2) → índice na paleta. */
function gradientFor(seed: string): readonly [string, string] {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function initialsOf(company: string): string {
  return company
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface CompanyAvatarProps {
  company: string;
  /** Lado do quadrado em px (default 42, usado na lista; o detalhe usa 52). */
  size?: number;
}

/**
 * Avatar quadrado com as iniciais da empresa, em gradiente quente determinístico
 * por empresa. Mesma empresa → mesmo gradiente em qualquer lugar do app.
 */
export function CompanyAvatar({ company, size = 42 }: CompanyAvatarProps) {
  const initials = initialsOf(company);
  const [from, to] = gradientFor(company.trim().toLowerCase() || 'sieve');
  return (
    <Box
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        flexShrink: 0,
        color: '#fff',
        fontSize: Math.round(size * 0.33),
        fontWeight: 700,
        letterSpacing: 0.3,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: `0 2px 8px -2px ${to}80`,
      }}
    >
      {initials || <Briefcase size={Math.round(size * 0.42)} />}
    </Box>
  );
}
