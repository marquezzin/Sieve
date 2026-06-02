
// ===== src/icons.jsx =====
// Lucide-style line icons as lightweight React components.
const Svg = ({ size = 20, sw = 2, children, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);

const Icon = {
  Filter:   (p) => <Svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></Svg>,
  Home:     (p) => <Svg {...p}><rect width="7" height="9" x="3" y="3" rx="1.5"/><rect width="7" height="5" x="14" y="3" rx="1.5"/><rect width="7" height="9" x="14" y="12" rx="1.5"/><rect width="7" height="5" x="3" y="16" rx="1.5"/></Svg>,
  Chat:     (p) => <Svg {...p}><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></Svg>,
  File:     (p) => <Svg {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></Svg>,
  Briefcase:(p) => <Svg {...p}><rect width="20" height="14" x="2" y="7" rx="2.5"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></Svg>,
  Kanban:   (p) => <Svg {...p}><rect width="18" height="18" x="3" y="3" rx="2.5"/><path d="M8 7v8"/><path d="M12 7v4"/><path d="M16 7v10"/></Svg>,
  User:     (p) => <Svg {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>,
  Send:     (p) => <Svg {...p}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></Svg>,
  Plus:     (p) => <Svg {...p}><path d="M5 12h14"/><path d="M12 5v14"/></Svg>,
  Check:    (p) => <Svg {...p}><path d="M20 6 9 17l-5-5"/></Svg>,
  CheckCircle:(p)=> <Svg {...p}><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></Svg>,
  ChevronDown:(p)=> <Svg {...p}><path d="m6 9 6 6 6-6"/></Svg>,
  ChevronRight:(p)=> <Svg {...p}><path d="m9 18 6-6-6-6"/></Svg>,
  ArrowRight:(p)=> <Svg {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Svg>,
  Bell:     (p) => <Svg {...p}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></Svg>,
  LogOut:   (p) => <Svg {...p}><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></Svg>,
  Sparkles: (p) => <Svg {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></Svg>,
  Upload:   (p) => <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></Svg>,
  Download: (p) => <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></Svg>,
  Search:   (p) => <Svg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></Svg>,
  Clock:    (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>,
  Alert:    (p) => <Svg {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></Svg>,
  Refresh:  (p) => <Svg {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></Svg>,
  Menu:     (p) => <Svg {...p}><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></Svg>,
  X:        (p) => <Svg {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Svg>,
  Mail:     (p) => <Svg {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></Svg>,
  Lock:     (p) => <Svg {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Svg>,
  MapPin:   (p) => <Svg {...p}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></Svg>,
  Flag:     (p) => <Svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></Svg>,
  ArrowUp:  (p) => <Svg {...p}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></Svg>,
  Paperclip:(p) => <Svg {...p}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></Svg>,
  PenLine:  (p) => <Svg {...p}><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></Svg>,
  Square:   (p) => <Svg {...p}><rect width="14" height="14" x="5" y="5" rx="2"/></Svg>,
  Command:  (p) => <Svg {...p}><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></Svg>,
  Settings: (p) => <Svg {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2"/><circle cx="12" cy="12" r="3"/></Svg>,
  Lightbulb:(p) => <Svg {...p}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></Svg>,
  Dots:     (p) => <Svg {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Svg>,
  GripV:    (p) => <Svg {...p}><circle cx="9" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="18" r="1.4"/></Svg>,
  Link:     (p) => <Svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Svg>,
  Building: (p) => <Svg {...p}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></Svg>,
  Calendar: (p) => <Svg {...p}><path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></Svg>,
  Stars:    (p) => <Svg {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></Svg>,
  Sliders:  (p) => <Svg {...p}><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></Svg>,
  Globe:    (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></Svg>,
};

window.Icon = Icon;


// ===== src/ui.jsx =====
// ── helpers ──────────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(' ');
const uid = () => 'g' + Math.random().toString(36).slice(2, 8);

// ── Button ─────────────────────────────────────────────────────────────────
function Button({ variant = 'primary', size = 'md', loading, disabled, icon: IconC, iconRight, full, children, className, ...props }) {
  const sizes = { xs:'h-7 px-2.5 text-xs gap-1', sm: 'h-9 px-3.5 text-[13px] gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-[15px] gap-2' };
  const variants = {
    primary: 'text-white bg-gradient-to-b from-indigo-5 to-indigo-7 hover:from-indigo-6 hover:to-indigo-8 shadow-[0_1px_2px_rgba(48,62,120,.4),inset_0_1px_0_rgba(255,255,255,.18)] active:translate-y-px',
    light:   'bg-indigo-0 text-indigo-7 hover:bg-indigo-1',
    subtle:  'text-indigo-7 hover:bg-indigo-0',
    default: 'bg-white text-gray-8 border border-gray-3 hover:bg-gray-0 hover:border-gray-4 shadow-card',
    danger:  'text-white bg-gradient-to-b from-red-5 to-red-7 hover:from-red-6 hover:to-red-8 shadow-sm',
    ghost:   'text-gray-7 hover:bg-gray-1',
    dark:    'text-white bg-gradient-to-b from-ink-8 to-ink-9 hover:from-ink-7 shadow-sm',
  };
  const isDisabled = disabled || loading;
  return (
    <button disabled={isDisabled} className={cx('inline-flex items-center justify-center whitespace-nowrap font-semibold rounded-[10px] transition-all duration-150 select-none focus:outline-none focus-visible:shadow-glow',
      sizes[size], variants[variant], full && 'w-full', isDisabled && 'opacity-55 cursor-not-allowed active:translate-y-0', className)} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {!loading && IconC && <IconC size={size === 'lg' ? 19 : 16} />}
      {children}
      {!loading && iconRight && React.createElement(iconRight, { size: size === 'lg' ? 19 : 16 })}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────
function Card({ className, hover, glass, children, ...props }) {
  return <div className={cx('rounded-card border shadow-card relative',
    glass ? 'bg-white/70 backdrop-blur border-white/60' : 'bg-white border-gray-2',
    hover && 'transition-all duration-200 hover:shadow-cardhover hover:-translate-y-0.5', className)} {...props}>{children}</div>;
}

// ── Badge / StatusBadge ────────────────────────────────────────────────────
function Badge({ color = 'gray', children, dot, soft = true, className }) {
  const map = {
    gray:'bg-gray-1 text-gray-7 ring-gray-2', indigo:'bg-indigo-0 text-indigo-7 ring-indigo-1',
    green:'bg-green-0 text-green-8 ring-green-1', yellow:'bg-yellow-1 text-yellow-8 ring-yellow-2',
    red:'bg-red-0 text-red-7 ring-red-1', teal:'bg-[#e6fcf5] text-teal-7 ring-[#c3fae8]',
  };
  const dotc = { gray:'bg-gray-5', indigo:'bg-indigo-6', green:'bg-green-6', yellow:'bg-yellow-6', red:'bg-red-6', teal:'bg-teal-6' };
  return <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ring-1 ring-inset', map[color], className)}>
    {dot && <span className={cx('w-1.5 h-1.5 rounded-full', dotc[color])} />}{children}</span>;
}

function StatusBadge({ status }) {
  const map = {
    generating: { color: 'yellow', label: 'Gerando' },
    ready:      { color: 'green',  label: 'Pronto' },
    failed:     { color: 'red',    label: 'Falhou' },
    draft:      { color: 'gray',   label: 'Rascunho' },
  };
  const s = map[status] || map.ready;
  return <Badge color={s.color} dot>{s.label}</Badge>;
}

// ── Avatar ──────────────────────────────────────────────────────────────
function Avatar({ name = 'Marina Costa', size = 36, gradient, ring }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <span className={cx('inline-flex items-center justify-center rounded-full font-bold shrink-0 text-white',
      ring && 'ring-2 ring-white shadow-sm')}
    style={{ width: size, height: size, fontSize: size * 0.36,
      background: gradient || 'linear-gradient(135deg,#e07c52,#b8451f)' }}>{initials}</span>;
}

// ── ScoreGauge (gradient ring + mono numeral) ──────────────────────────────
function ScoreGauge({ score, max = 10, size = 150, label, sub, thickness = 11 }) {
  const id = React.useRef(uid()).current;
  const pct = Math.max(0, Math.min(1, score / max));
  const r = size / 2 - thickness / 2 - 2, c = 2 * Math.PI * r;
  const tone = max === 10 ? (score >= 7.5 ? 'green' : score >= 5 ? 'yellow' : 'red')
                          : (score >= 75 ? 'green' : score >= 50 ? 'yellow' : 'red');
  const grad = { green:['#69db7c','#2f9e44'], yellow:['#ffd43b','#f08c00'], red:['#ff8787','#e03131'] }[tone];
  const display = max === 100 ? `${Math.round(score)}` : score.toFixed(1);
  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 overflow-visible">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={grad[0]} /><stop offset="100%" stopColor={grad[1]} />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--gauge-track,#eceef5)" strokeWidth={thickness} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.3,1)', filter: `drop-shadow(0 2px 5px ${grad[1]}55)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-semibold text-ink-9 leading-none tracking-tight" style={{ fontSize: size * 0.28 }}>{display}<span className="text-gray-4" style={{ fontSize: size*0.13 }}>{max===100?'%':'/10'}</span></span>
        </div>
      </div>
      {label && <span className="mt-2.5 text-sm font-bold text-ink-8">{label}</span>}
      {sub && <span className="text-xs text-gray-6 mt-0.5">{sub}</span>}
    </div>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, w = 96, h = 34, color = '#cf5530' }) {
  const id = React.useRef(uid()).current;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => [ (i/(data.length-1))*w, h - 4 - ((v-min)/span)*(h-8) ]);
  const line = pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.6" fill={color} />
    </svg>
  );
}

function Skeleton({ className, rounded = 'rounded-lg' }) { return <div className={cx('skeleton', rounded, className)} />; }

function Kbd({ children }) {
  return <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-gray-1 border border-gray-3 text-[11px] font-mono font-semibold text-gray-6 shadow-[inset_0_-1px_0_rgba(0,0,0,.04)]">{children}</kbd>;
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const tones = {
    success: { icon: Icon.CheckCircle, ic:'text-green-6', ring:'ring-green-1' },
    error:   { icon: Icon.Alert, ic:'text-red-6', ring:'ring-red-1' },
    info:    { icon: Icon.Sparkles, ic:'text-indigo-6', ring:'ring-indigo-1' },
  };
  const t = tones[toast.type] || tones.success;
  return (
    <div className="fixed bottom-6 right-6 z-[60] fadeup">
      <div className={cx('flex items-start gap-3 bg-white/90 backdrop-blur rounded-2xl shadow-pop ring-1 px-4 py-3.5 min-w-[320px] max-w-[400px]', t.ring)}>
        <span className={cx('mt-0.5 shrink-0', t.ic)}><t.icon size={20} /></span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-9">{toast.title}</p>
          {toast.msg && <p className="text-[13px] text-gray-6 mt-0.5 leading-snug">{toast.msg}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Navigation model ────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { label: 'Principal', items: [
    { id: 'home', label: 'Início', icon: Icon.Home },
    { id: 'chat', label: 'Chat', icon: Icon.Chat, tag: 'IA' },
  ]},
  { label: 'Carreira', items: [
    { id: 'resumes', label: 'Currículos', icon: Icon.File },
    { id: 'jobs', label: 'Vagas', icon: Icon.Briefcase },
    { id: 'apps', label: 'Candidaturas', icon: Icon.Kanban, count: 5 },
  ]},
  { label: 'Conta', items: [
    { id: 'profile', label: 'Perfil', icon: Icon.User },
  ]},
];
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

function Logo({ compact }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <span className="grid place-items-center w-8 h-8 rounded-[10px] text-white shrink-0 shadow-[0_2px_8px_rgba(207,85,48,.45),inset_0_1px_0_rgba(255,255,255,.25)] bg-gradient-to-br from-indigo-5 to-indigo-8"><Icon.Filter size={17} /></span>
      {!compact && <span className="font-display text-[20px] font-extrabold tracking-tight text-ink-9">Sieve</span>}
    </div>
  );
}

// Centered search pill (reference disposition)
function SearchPill() {
  return (
    <button className="group hidden md:flex items-center h-12 rounded-full bg-white border border-gray-3 shadow-card hover:shadow-cardhover transition-all pl-5 pr-2 text-left">
      <span className="text-[14px] font-bold text-ink-9">Buscar</span>
      <span className="w-px h-5 bg-gray-3 mx-3.5" />
      <span className="text-[13.5px] text-gray-6 font-medium">vagas, currículos, candidaturas…</span>
      <span className="grid place-items-center w-8 h-8 rounded-full ml-3.5 text-white bg-gradient-to-b from-indigo-5 to-indigo-7 group-hover:from-indigo-6 group-hover:to-indigo-8 transition-colors"><Icon.Search size={15} /></span>
    </button>
  );
}

// Airbnb-style category/nav item: stacked icon + label, active underline
function TopNavItem({ item, active, onClick }) {
  return (
    <button onClick={onClick}
      className={cx('group relative flex flex-col items-center justify-center gap-1.5 shrink-0 px-2 pt-2 pb-2.5 min-w-[68px] transition-colors',
        active ? 'text-ink-9' : 'text-gray-6 hover:text-ink-8')}>
      <span className="relative">
        <item.icon size={21} />
        {item.count != null && <span className="absolute -top-1.5 -right-2.5 text-[10px] font-bold tnum px-1 min-w-[16px] h-4 grid place-items-center rounded-full bg-indigo-6 text-white ring-2 ring-white">{item.count}</span>}
      </span>
      <span className="text-[12px] font-bold whitespace-nowrap flex items-center gap-1">
        {item.label}
        {item.tag && <span className="text-[9px] font-bold px-1 py-px rounded bg-indigo-0 text-indigo-7 ring-1 ring-indigo-1">{item.tag}</span>}
      </span>
      <span className={cx('absolute left-2 right-2 -bottom-px h-[2.5px] rounded-full transition-all',
        active ? 'bg-ink-9' : 'bg-transparent group-hover:bg-gray-3')} />
    </button>
  );
}

function AppShell({ route, setRoute, children, onNewInterview, onLogout }) {
  const [menu, setMenu] = React.useState(false);
  return (
    <div className="h-screen flex flex-col">
      <header className="shrink-0 bg-cream/90 backdrop-blur-xl border-b border-gray-2 z-30">
        {/* Row 1 — logo · search · user */}
        <div className="h-[72px] flex items-center justify-between gap-3 px-5 lg:px-8">
          <div className="shrink-0"><Logo /></div>
          <div className="flex-1 flex justify-center px-2"><SearchPill /></div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={onNewInterview} className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13.5px] font-bold text-ink-9 whitespace-nowrap hover:bg-gray-1 transition-colors"><Icon.Sparkles size={16} className="text-indigo-6" /> Nova entrevista</button>
            <button className="relative grid place-items-center w-10 h-10 rounded-full text-gray-7 hover:bg-gray-1 transition-colors">
              <Icon.Bell size={19} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-6 ring-2 ring-cream" />
            </button>
            <div className="relative">
              <button onClick={() => setMenu(v => !v)} className="flex items-center gap-2.5 h-11 pl-3 pr-1.5 rounded-full border border-gray-3 bg-white hover:shadow-card transition-all">
                <Icon.Menu size={16} className="text-gray-7" />
                <Avatar name="Marina Costa" size={30} />
              </button>
              {menu && (<>
                <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-[52px] z-50 w-60 bg-white rounded-2xl shadow-pop border border-gray-2 p-1.5 pop">
                  <div className="flex items-center gap-3 px-3 py-2.5 mb-1 border-b border-gray-1">
                    <Avatar name="Marina Costa" size={38} ring />
                    <div className="min-w-0"><p className="text-[13.5px] font-bold text-ink-9 truncate">Marina Costa</p><p className="text-[12px] text-gray-5 truncate">marina.costa@email.com</p></div>
                  </div>
                  {[{label:'Meu perfil',icon:Icon.User,act:()=>setRoute('profile')},{label:'Configurações',icon:Icon.Settings,act:()=>{}}].map(it=>(
                    <button key={it.label} onClick={()=>{it.act();setMenu(false);}} className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-semibold text-gray-7 hover:bg-gray-1 transition-colors"><it.icon size={17} className="text-gray-5"/>{it.label}</button>
                  ))}
                  <div className="my-1 h-px bg-gray-1" />
                  <button onClick={()=>{setMenu(false);onLogout&&onLogout();}} className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-semibold text-red-6 hover:bg-red-0 transition-colors"><Icon.LogOut size={17}/>Sair</button>
                </div>
              </>)}
            </div>
          </div>
        </div>
        {/* Row 2 — horizontal nav (reference category bar) */}
        <div className="h-[60px] flex items-center gap-1 px-5 lg:px-8 border-t border-gray-1">
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {ALL_NAV.map(item => (
              <TopNavItem key={item.id} item={item} active={route === item.id} onClick={() => setRoute(item.id)} />
            ))}
          </nav>
          <button className="shrink-0 inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-gray-3 bg-white text-[13px] font-bold text-ink-9 hover:border-gray-4 hover:shadow-card transition-all">
            <Icon.Sliders size={15} /> <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto canvas-bg relative min-h-0">
        <div className="absolute inset-x-0 top-0 h-72 glow-top pointer-events-none" />
        <div className="relative h-full">{children}</div>
      </main>
    </div>
  );
}

function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[.14em] text-indigo-6 mb-1.5">{eyebrow}</p>}
        <h1 className="text-[26px] font-extrabold text-ink-9 tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-gray-6 mt-1.5 text-[15px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

function StateToggle({ options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-gray-2 shadow-card">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={cx('px-3 h-8 rounded-lg text-[12.5px] font-bold transition-all',
            value === o.value ? 'bg-indigo-6 text-white shadow-sm' : 'text-gray-6 hover:text-ink-9 hover:bg-gray-1')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children, right }) {
  return <div className="flex items-center justify-between mb-3">
    <h3 className="text-[15px] font-bold text-ink-9">{children}</h3>{right}</div>;
}

// Page container with eyebrow/title
function Page({ children, className, narrow }) {
  return <div className={cx('mx-auto px-6 lg:px-8 py-8', narrow ? 'max-w-[920px]' : 'max-w-[1160px]', className)}>{children}</div>;
}

function Field({ label, hint, children, error }) {
  return (
    <label className="block">
      {label && <span className="block text-[13px] font-bold text-ink-8 mb-1.5">{label}</span>}
      {children}
      {error ? <span className="block text-[12px] text-red-6 mt-1.5 font-medium">{error}</span>
             : hint && <span className="block text-[12px] text-gray-5 mt-1.5">{hint}</span>}
    </label>
  );
}

const inputCls = 'w-full h-11 px-3.5 rounded-xl bg-white border border-gray-3 text-[14px] text-ink-9 placeholder:text-gray-5 outline-none transition-all focus:border-indigo-4 focus:shadow-glow';
function Input(props) { return <input {...props} className={cx(inputCls, props.className)} />; }
function Textarea(props) { return <textarea {...props} className={cx('w-full px-3.5 py-3 rounded-xl bg-white border border-gray-3 text-[14px] leading-relaxed text-ink-9 placeholder:text-gray-5 outline-none transition-all resize-y focus:border-indigo-4 focus:shadow-glow', props.className)} />; }

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-1 border border-gray-2">
      {tabs.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)}
          className={cx('inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-bold transition-all',
            value === t.value ? 'bg-white text-ink-9 shadow-card' : 'text-gray-6 hover:text-ink-9')}>
          {t.icon && <t.icon size={15} />}{t.label}
          {t.count != null && <span className={cx('text-[11px] tnum px-1.5 rounded-full', value===t.value?'bg-indigo-0 text-indigo-7':'bg-gray-2 text-gray-6')}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, children, footer, width = 520 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fadein">
      <div className="absolute inset-0 bg-ink-9/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-card shadow-pop border border-gray-2 pop overflow-hidden" style={{ maxWidth: width }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-2">
          <h3 className="text-[17px] font-bold text-ink-9">{title}</h3>
          <button onClick={onClose} className="grid place-items-center w-9 h-9 rounded-lg text-gray-6 hover:bg-gray-1 transition-colors"><Icon.X size={18} /></button>
        </div>
        <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-2 bg-gray-0">{footer}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon: IconC, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-b from-indigo-0 to-white ring-1 ring-inset ring-indigo-1 text-indigo-6 mb-5 shadow-card">{IconC && <IconC size={28} />}</span>
      <h3 className="text-lg font-bold text-ink-9">{title}</h3>
      {desc && <p className="text-gray-6 mt-1.5 max-w-sm text-[14px] leading-relaxed">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function Placeholder({ route, setRoute }) {
  const current = ALL_NAV.find(n => n.id === route);
  return (
    <div className="max-w-[900px] mx-auto px-8 py-12">
      <div className="flex flex-col items-center justify-center text-center py-24 fadein">
        <span className="grid place-items-center w-16 h-16 rounded-2xl bg-white border border-gray-2 shadow-card text-indigo-6 mb-5">
          {current && <current.icon size={28} />}
        </span>
        <h2 className="text-xl font-extrabold text-ink-9">{current?.label}</h2>
        <p className="text-gray-6 mt-2 max-w-sm">Esta tela entra na próxima etapa. Estamos com Dashboard e Chat prontos no novo padrão visual.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="default" onClick={() => setRoute('home')} icon={Icon.Home}>Ir ao Início</Button>
          <Button onClick={() => setRoute('chat')} icon={Icon.Chat}>Abrir o Chat</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { cx, uid, Button, Card, Badge, StatusBadge, Avatar, ScoreGauge, Sparkline, Skeleton, Kbd, Toast, AppShell, PageHeader, StateToggle, SectionLabel, Page, Field, Input, Textarea, inputCls, Tabs, Modal, EmptyState, Placeholder, Logo, NAV_GROUPS, ALL_NAV });


// ===== src/dashboard.jsx =====
function StatCard({ icon: IconC, label, value, unit, tone = 'indigo', spark, sparkColor, foot }) {
  const tones = {
    indigo: 'from-indigo-0 to-white text-indigo-6 ring-indigo-1',
    green:  'from-green-0 to-white text-green-7 ring-green-1',
    violet: 'from-[#f3f0ff] to-white text-[#7048e8] ring-[#e5dbff]',
  };
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <span className={cx('grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-b ring-1 ring-inset shadow-sm', tones[tone])}><IconC size={20} /></span>
        {spark && <Sparkline data={spark} color={sparkColor} />}
      </div>
      <p className="text-[13px] font-semibold text-gray-6 mt-4">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-[30px] font-extrabold text-ink-9 tracking-tight tnum leading-none">{value}</span>
        {unit && <span className="text-sm text-gray-5 font-semibold">{unit}</span>}
      </div>
      {foot && <div className="mt-3 pt-3 border-t border-gray-1">{foot}</div>}
    </Card>
  );
}

function Dashboard({ setRoute }) {
  const [state, setState] = React.useState('data');
  return (
    <div className="max-w-[1120px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="text-[11px] font-bold uppercase tracking-[.14em] text-gray-5">Pré-visualização de estado</div>
        <StateToggle value={state} onChange={setState} options={[
          { value: 'data', label: 'Com dados' }, { value: 'empty', label: 'Usuário novo' },
        ]} />
      </div>
      {state === 'data' ? <DashboardData setRoute={setRoute} /> : <DashboardEmpty setRoute={setRoute} />}
    </div>
  );
}

function DashboardData({ setRoute }) {
  return (
    <div className="fadeup">
      <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-indigo-6 mb-1.5">Segunda, 1 de junho</p>
          <h1 className="text-[28px] font-extrabold text-ink-9 tracking-tight">Olá, Marina 👋</h1>
          <p className="text-gray-6 mt-1.5 text-[15px]">2 candidaturas avançaram de estágio nesta semana.</p>
        </div>
        <Button variant="default" icon={Icon.Briefcase} onClick={() => setRoute('jobs')}>Analisar nova vaga</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard icon={Icon.File} label="Currículos" value="2" unit="versões" tone="indigo" spark={[3,4,3,5,6,5,7]} sparkColor="#cf5530"
          foot={<p className="text-[12.5px] text-gray-6">Última geração <span className="font-semibold text-ink-8">há 2 dias</span></p>} />
        <StatCard icon={Icon.Kanban} label="Candidaturas ativas" value="5" tone="green" spark={[2,2,3,3,4,4,5]} sparkColor="#40c057"
          foot={<div className="flex items-center gap-2 text-[12.5px]"><Badge color="green" dot>2 avançaram</Badge><span className="text-gray-5">esta semana</span></div>} />
        <StatCard icon={Icon.Sparkles} label="Último score" value="8.4" unit="/ 10" tone="violet"
          foot={<div className="flex items-center gap-2"><div className="h-1.5 flex-1 rounded-full bg-gray-1 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-green-4 to-green-7" style={{ width: '84%' }} /></div><span className="text-[12px] font-bold text-green-7">ótimo</span></div>} />
      </div>

      {/* Continue hero */}
      <Card className="overflow-hidden mb-6 border-0">
        <div className="relative p-7 md:p-8 text-white bg-gradient-to-br from-indigo-6 via-indigo-7 to-ink-9">
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
          <div className="absolute right-24 bottom-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/3" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <Badge className="!bg-white/15 !text-white !ring-white/20 mb-3"><span className="inline-flex items-center gap-1.5"><Icon.Clock size={12}/> Entrevista em andamento</span></Badge>
              <h2 className="text-[22px] font-extrabold tracking-tight">Continue de onde parou</h2>
              <p className="text-indigo-1 mt-2 text-[15px] leading-relaxed">Você está na fase <strong className="text-white font-bold">Experiência profissional</strong>. Faltam <strong className="text-white font-bold">Projetos</strong> e <strong className="text-white font-bold">Skills</strong> para o entrevistador finalizar e gerar seu currículo.</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 w-52 rounded-full bg-white/20 overflow-hidden"><div className="h-full bg-white rounded-full transition-all" style={{ width: '64%' }} /></div>
                <span className="text-[12.5px] font-bold text-indigo-1 tnum">4 / 7 fases</span>
              </div>
            </div>
            <button onClick={() => setRoute('chat')} className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-indigo-7 font-bold whitespace-nowrap hover:shadow-pop transition-all shrink-0">
              Continuar entrevista <Icon.ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SectionLabel right={<button onClick={() => setRoute('resumes')} className="text-[13px] font-bold text-indigo-7 hover:text-indigo-8 inline-flex items-center gap-1">Ver todos <Icon.ChevronRight size={14}/></button>}>Currículos recentes</SectionLabel>
          <div className="flex flex-col gap-3">
            <ResumeRow title="Desenvolvedora Backend Python" target="Backend Sênior · Python / Django" status="ready" score={8.4} versions={2} date="há 2 dias" setRoute={setRoute} />
            <ResumeRow title="Engenheira de Dados" target="Data Engineer · Pleno" status="generating" date="agora" setRoute={setRoute} />
          </div>

          <SectionLabel right={<button onClick={() => setRoute('jobs')} className="text-[13px] font-bold text-indigo-7 hover:text-indigo-8 inline-flex items-center gap-1">Analisar vaga <Icon.ChevronRight size={14}/></button>}><span className="mt-6 inline-block">Aderência às últimas vagas</span></SectionLabel>
          <Card className="p-2">
            {[
              { co:'Nubank', role:'Engenheira de Software Backend', score:88 },
              { co:'Stone', role:'Desenvolvedora Python Pleno', score:76 },
              { co:'iFood', role:'Data Engineer', score:54 },
            ].map((j,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-0 transition-colors cursor-pointer" onClick={()=>setRoute('jobs')}>
                <Avatar name={j.co} size={36} gradient="linear-gradient(135deg,#adb5bd,#495057)" />
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-ink-9 truncate">{j.role}</p><p className="text-[12.5px] text-gray-6">{j.co}</p></div>
                <div className="flex items-center gap-2.5 w-40">
                  <div className="h-2 flex-1 rounded-full bg-gray-1 overflow-hidden"><div className={cx('h-full rounded-full', j.score>=75?'bg-green-6':j.score>=50?'bg-yellow-5':'bg-red-5')} style={{width:`${j.score}%`}} /></div>
                  <span className={cx('text-[13px] font-bold tnum font-mono w-9 text-right', j.score>=75?'text-green-7':j.score>=50?'text-yellow-7':'text-red-6')}>{j.score}%</span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <SectionLabel>Atividade recente</SectionLabel>
          <Card className="p-2">
            {[
              { icon: Icon.Kanban, tone:'green', text:<><strong className="font-bold text-ink-9">Nubank</strong> avançou para <strong className="font-bold text-ink-9">Entrevista técnica</strong></>, time:'há 3 horas' },
              { icon: Icon.Sparkles, tone:'indigo', text:<>Currículo <strong className="font-bold text-ink-9">v2</strong> avaliado com nota <strong className="font-bold text-ink-9">8.4</strong></>, time:'há 2 dias' },
              { icon: Icon.Briefcase, tone:'gray', text:<>Vaga <strong className="font-bold text-ink-9">Stone</strong> analisada — 76% de aderência</>, time:'há 4 dias' },
              { icon: Icon.User, tone:'gray', text:<>Foto profissional gerada com sucesso</>, time:'há 5 dias' },
            ].map((a,i)=>(
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-0 transition-colors">
                <span className={cx('grid place-items-center w-9 h-9 rounded-xl shrink-0 ring-1 ring-inset',
                  a.tone==='green'?'bg-green-0 text-green-7 ring-green-1':a.tone==='indigo'?'bg-indigo-0 text-indigo-6 ring-indigo-1':'bg-gray-1 text-gray-6 ring-gray-2')}>
                  <a.icon size={16} /></span>
                <div className="min-w-0 pt-0.5"><p className="text-[13.5px] text-gray-7 leading-snug">{a.text}</p><p className="text-[11.5px] text-gray-5 mt-1 font-medium">{a.time}</p></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResumeRow({ title, target, status, score, versions, date, setRoute }) {
  return (
    <Card hover className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setRoute('resumes')}>
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-b from-indigo-0 to-white ring-1 ring-inset ring-indigo-1 text-indigo-6 shrink-0"><Icon.File size={19} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><p className="font-bold text-ink-9 truncate">{title}</p>{versions && <Badge color="gray">v{versions}</Badge>}</div>
        <p className="text-[13px] text-gray-6 truncate mt-0.5">{target}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {status === 'ready' && score != null && (
          <div className="flex items-center gap-1.5"><span className="font-mono text-base font-semibold text-green-7 tnum">{score.toFixed(1)}</span><span className="text-gray-4 text-xs font-semibold">/10</span></div>
        )}
        {status === 'generating' && <span className="inline-flex items-center gap-1.5 text-[12px] text-yellow-7 font-semibold"><span className="w-3.5 h-3.5 border-2 border-yellow-5 border-t-transparent rounded-full animate-spin" />redigindo…</span>}
        <StatusBadge status={status} />
        <span className="text-[11.5px] text-gray-5 w-16 text-right hidden md:block font-medium">{date}</span>
        <Icon.ChevronRight size={16} className="text-gray-4" />
      </div>
    </Card>
  );
}

function DashboardEmpty({ setRoute }) {
  return (
    <div className="fadeup">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-indigo-6 mb-1.5">Bem-vinda ao Sieve</p>
      <h1 className="text-[28px] font-extrabold text-ink-9 tracking-tight">Olá, Marina 👋</h1>
      <p className="text-gray-6 mt-1.5 mb-7 text-[15px]">Vamos construir seu primeiro currículo profissional.</p>

      <Card className="relative overflow-hidden border-0 shadow-cardhover">
        <div className="grid md:grid-cols-2">
          <div className="p-10 md:p-12">
            <span className="grid place-items-center w-14 h-14 rounded-2xl text-white shadow-[0_8px_24px_rgba(207,85,48,.4)] bg-gradient-to-br from-indigo-5 to-indigo-8 mb-6"><Icon.Chat size={26} /></span>
            <h2 className="text-[24px] font-extrabold text-ink-9 tracking-tight leading-tight">Nenhum currículo ainda</h2>
            <p className="text-gray-6 mt-2.5 text-[15px] leading-relaxed">Sem formulários intermináveis. Um entrevistador por IA conversa com você, fase a fase, e um time de agentes redige, revisa e <strong className="text-ink-8 font-semibold">avalia seu currículo de 0 a 10</strong>.</p>
            <div className="flex items-center gap-3 mt-7">
              <Button size="lg" icon={Icon.Sparkles} onClick={() => setRoute('chat')}>Iniciar entrevista</Button>
              <span className="text-[13px] text-gray-5 font-medium">leva ~10 min</span>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-indigo-6 to-ink-9 p-10 md:p-12 flex flex-col justify-center gap-3">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,.4) 1px, transparent 0)', backgroundSize:'18px 18px' }} />
            {[
              { n:'01', t:'Dados pessoais', d:'Contato e localização' },
              { n:'02', t:'Formação', d:'Cursos e certificações' },
              { n:'03', t:'Experiência', d:'Cargos e conquistas' },
              { n:'04', t:'Projetos & Skills', d:'O que você domina' },
            ].map(s=>(
              <div key={s.n} className="relative flex items-center gap-3.5 rounded-xl bg-white/10 backdrop-blur px-3.5 py-3 ring-1 ring-white/15">
                <span className="font-mono text-[13px] font-semibold text-indigo-1 w-7">{s.n}</span>
                <div><p className="text-[14px] font-bold text-white leading-tight">{s.t}</p><p className="text-[12px] text-indigo-1">{s.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { Dashboard });


// ===== src/chat.jsx =====
const PHASES = [
  { id:'intro', label:'Introdução' },
  { id:'pessoais', label:'Dados pessoais' },
  { id:'formacao', label:'Formação' },
  { id:'experiencia', label:'Experiência' },
  { id:'projetos', label:'Projetos' },
  { id:'skills', label:'Skills' },
  { id:'revisao', label:'Revisão' },
];
const pidx = (id) => PHASES.findIndex(p => p.id === id);

// Seed: conversation already in progress, paused at "Experiência" (matches the dashboard)
const SEED = [
  { role:'assistant', text:'Oi, Marina! Eu sou o entrevistador do Sieve. Vou te fazer algumas perguntas, fase a fase, e no final um time de agentes redige e avalia seu currículo. Pode ser informal — eu organizo tudo. 😊', t:'10:24' },
  { role:'user', text:'Oi! Pode começar.', t:'10:24' },
  { role:'assistant', text:'Perfeito. Começando pelos dados básicos: qual seu nome completo, cidade e um e-mail de contato?', t:'10:25' },
  { role:'user', text:'Marina Costa, São Paulo – SP. marina.costa@email.com', t:'10:25' },
  { role:'assistant', text:'Anotado ✓ Sobre formação: qual curso, instituição e ano de conclusão?', t:'10:27' },
  { role:'user', text:'Bacharelado em Ciência da Computação na USP, concluí em 2021.', t:'10:28' },
  { role:'assistant', text:'Ótimo. Agora a parte mais importante — sua experiência. Me conta sobre seu cargo atual: empresa, período e principais responsabilidades.', t:'10:29' },
];

// Scripted interviewer turns consumed as the user replies
const SCRIPT = [
  { role:'clarification', text:'Você mencionou que “melhorou o sistema de pagamentos”. Consegue quantificar o impacto? Recrutadores e o ATS valorizam números — ex.: reduziu a latência em X%, processou Y transações/dia, economizou Z horas.',
    suggestions:['Reduzi a latência em ~40%','Processava 2M transações/dia','Não tenho os números exatos'] },
  { role:'assistant', text:'Excelente — métricas concretas fazem muita diferença. 💪 Vamos para os Projetos: você tem algum projeto pessoal, open-source ou freela relevante para destacar?', phase:'projetos',
    suggestions:['Tenho um projeto open-source','Contribuí pra uma lib','Não, prefiro focar na experiência'] },
  { role:'assistant', text:'Anotado. Agora suas Skills técnicas: liste linguagens, frameworks e ferramentas que você domina (e marque as que usa no dia a dia).', phase:'skills',
    suggestions:['Python, Django, FastAPI, PostgreSQL','Docker, AWS, Kubernetes','Pytest, CI/CD, Redis'] },
  { role:'assistant', text:'Perfeito, Marina! Tenho material para um currículo forte: dados, formação, experiência com métricas, um projeto e suas skills. Quer ajustar algo ou posso finalizar e gerar o currículo?', phase:'revisao',
    suggestions:['Pode finalizar 🚀','Quero revisar a experiência'] },
  { role:'assistant', text:'Combinado! É só clicar em “Finalizar entrevista” no topo que eu aciono o time de agentes (redator → revisor → juiz) e em alguns segundos seu currículo aparece em Currículos, com nota.', },
];

function InterviewerAvatar({ size = 36 }) {
  return <span className="grid place-items-center rounded-full text-white shrink-0 shadow-[0_3px_10px_rgba(207,85,48,.4)] bg-gradient-to-br from-indigo-5 via-indigo-6 to-ink-9 ring-2 ring-white"
    style={{ width:size, height:size }}><Icon.Sparkles size={size*0.5} /></span>;
}

// ── Phase displays ──────────────────────────────────────────────────────────
function StepperTop({ current }) {
  const ci = pidx(current);
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-1 py-0.5">
      {PHASES.map((p, i) => {
        const done = i < ci, active = i === ci;
        return (
          <React.Fragment key={p.id}>
            <div className={cx('flex items-center gap-2 shrink-0 rounded-full pl-1.5 pr-3 py-1 transition-all',
              active ? 'bg-indigo-0 ring-1 ring-indigo-2' : '')}>
              <span className={cx('grid place-items-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 transition-all',
                done ? 'bg-green-6 text-white' : active ? 'bg-indigo-6 text-white shadow-[0_0_0_4px_rgba(76,110,245,.15)]' : 'bg-gray-1 text-gray-5 ring-1 ring-gray-2')}>
                {done ? <Icon.Check size={13} /> : i+1}
              </span>
              <span className={cx('text-[12.5px] font-bold whitespace-nowrap', active ? 'text-indigo-8' : done ? 'text-gray-7' : 'text-gray-5')}>{p.label}</span>
            </div>
            {i < PHASES.length-1 && <span className={cx('w-4 h-0.5 rounded-full shrink-0', i < ci ? 'bg-green-4' : 'bg-gray-2')} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PhaseRail({ current }) {
  const ci = pidx(current);
  return (
    <aside className="hidden lg:flex flex-col w-[272px] shrink-0 border-l border-gray-2 bg-white/60 backdrop-blur p-5 overflow-y-auto">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gray-5 mb-1">Progresso da entrevista</p>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-2xl font-semibold text-ink-9 tnum">{ci}</span>
        <span className="text-sm text-gray-5">/ {PHASES.length} fases</span>
      </div>
      <div className="relative flex flex-col gap-1">
        <span className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-gray-2" />
        {PHASES.map((p,i) => {
          const done = i < ci, active = i === ci;
          return (
            <div key={p.id} className={cx('relative flex items-center gap-3 rounded-xl px-2 py-2 transition-all', active && 'bg-indigo-0')}>
              <span className={cx('relative z-10 grid place-items-center w-7 h-7 rounded-full text-[11px] font-bold shrink-0',
                done ? 'bg-green-6 text-white' : active ? 'bg-indigo-6 text-white ring-4 ring-indigo-1' : 'bg-white text-gray-5 ring-1 ring-gray-3')}>
                {done ? <Icon.Check size={14}/> : i+1}</span>
              <span className={cx('text-[13.5px] font-bold', active ? 'text-indigo-8' : done ? 'text-gray-7' : 'text-gray-5')}>{p.label}</span>
              {active && <span className="ml-auto"><span className="flex gap-0.5"><span className="dot1 w-1 h-1 rounded-full bg-indigo-5"/><span className="dot2 w-1 h-1 rounded-full bg-indigo-5"/><span className="dot3 w-1 h-1 rounded-full bg-indigo-5"/></span></span>}
            </div>
          );
        })}
      </div>
      <div className="mt-auto pt-5">
        <div className="rounded-xl bg-gray-0 border border-gray-2 p-3.5">
          <p className="text-[12px] font-bold text-ink-8 flex items-center gap-1.5"><Icon.Lightbulb size={14} className="text-yellow-6"/> Dica</p>
          <p className="text-[12px] text-gray-6 mt-1.5 leading-snug">Respostas com números e resultados geram um currículo com nota mais alta.</p>
        </div>
      </div>
    </aside>
  );
}

// ── Message bubbles ──────────────────────────────────────────────────────────
function Bubble({ m }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end pop">
        <div className="max-w-[84%] md:max-w-[70%]">
          <div className="rounded-2xl rounded-tr-md px-4 py-3 text-white text-[14.5px] leading-relaxed bg-gradient-to-br from-indigo-5 to-indigo-7 shadow-[0_2px_8px_rgba(207,85,48,.3)]">{m.text}</div>
          {m.t && <p className="text-[11px] text-gray-5 mt-1 text-right pr-1">{m.t}</p>}
        </div>
      </div>
    );
  }
  if (m.role === 'clarification') {
    return (
      <div className="flex gap-3 pop">
        <InterviewerAvatar />
        <div className="max-w-[84%] md:max-w-[74%]">
          <div className="rounded-2xl rounded-tl-md overflow-hidden ring-1 ring-indigo-2 shadow-card">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-indigo-0 border-b border-indigo-1">
              <Icon.PenLine size={13} className="text-indigo-6" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-7">Pedido de esclarecimento</span>
            </div>
            <div className="px-4 py-3 bg-white text-[14.5px] leading-relaxed text-ink-8">{m.text}</div>
          </div>
          {m.t && <p className="text-[11px] text-gray-5 mt-1 pl-1">{m.t}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 pop">
      <InterviewerAvatar />
      <div className="max-w-[84%] md:max-w-[74%]">
        <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white border border-gray-2 text-[14.5px] leading-relaxed text-ink-8 shadow-card">{m.text}</div>
        {m.t && <p className="text-[11px] text-gray-5 mt-1 pl-1">{m.t}</p>}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-3 fadein">
      <InterviewerAvatar />
      <div className="rounded-2xl rounded-tl-md px-4 py-4 bg-white border border-gray-2 shadow-card inline-flex items-center gap-1.5">
        <span className="dot1 w-2 h-2 rounded-full bg-gray-4" /><span className="dot2 w-2 h-2 rounded-full bg-gray-4" /><span className="dot3 w-2 h-2 rounded-full bg-gray-4" />
      </div>
    </div>
  );
}

function Suggestions({ items, onPick }) {
  return (
    <div className="flex flex-wrap gap-2 pl-12">
      {items.map((s,i) => (
        <button key={i} onClick={() => onPick(s)}
          className="text-[13px] font-semibold text-indigo-7 bg-white border border-indigo-2 rounded-full px-3.5 py-1.5 hover:bg-indigo-0 hover:border-indigo-3 transition-all shadow-sm">{s}</button>
      ))}
    </div>
  );
}

// ── Composer ──────────────────────────────────────────────────────────────
function Composer({ value, setValue, onSend, disabled }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);
  const send = () => { if (value.trim() && !disabled) onSend(value.trim()); };
  return (
    <div className="composer-fade px-4 md:px-6 pb-5 pt-3">
      <div className="max-w-[900px] mx-auto">
        <div className={cx('flex items-center gap-2 bg-white rounded-2xl border shadow-card transition-all px-2.5 py-2', disabled ? 'border-gray-2 opacity-80' : 'border-gray-3 focus-within:border-indigo-4 focus-within:shadow-glow')}>
          <button className="grid place-items-center w-9 h-9 rounded-lg text-gray-5 hover:bg-gray-1 hover:text-gray-7 transition-colors shrink-0" title="Anexar"><Icon.Paperclip size={18} /></button>
          <textarea ref={ref} rows={1} value={value} disabled={disabled}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={disabled ? 'O entrevistador está respondendo…' : 'Escreva sua resposta…'}
            className="flex-1 resize-none bg-transparent outline-none text-[14.5px] leading-6 text-ink-9 placeholder:text-gray-5 py-2 min-h-[40px] max-h-40" />
          <button onClick={send} disabled={!value.trim() || disabled}
            className={cx('grid place-items-center w-10 h-10 rounded-xl shrink-0 transition-all',
              value.trim() && !disabled ? 'text-white bg-gradient-to-b from-indigo-5 to-indigo-7 hover:from-indigo-6 hover:to-indigo-8 shadow-sm' : 'bg-gray-1 text-gray-4 cursor-not-allowed')}>
            <Icon.ArrowUp size={19} />
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-5 mt-2">Enter envia · Shift+Enter quebra linha — o Sieve organiza o resto.</p>
      </div>
    </div>
  );
}

// ── Empty (no session) ──────────────────────────────────────────────────────
function ChatEmpty({ onStart }) {
  return (
    <div className="h-full grid place-items-center px-6 fadeup">
      <div className="text-center max-w-md">
        <span className="inline-grid place-items-center w-16 h-16 rounded-2xl text-white mb-6 shadow-[0_10px_30px_rgba(207,85,48,.45)] bg-gradient-to-br from-indigo-5 via-indigo-6 to-ink-9" style={{ animation:'ringpulse 2.4s infinite' }}><Icon.Sparkles size={30} /></span>
        <h2 className="text-2xl font-extrabold text-ink-9 tracking-tight">Pronta para começar?</h2>
        <p className="text-gray-6 mt-2.5 text-[15px] leading-relaxed">O entrevistador do Sieve vai te guiar por 7 fases rápidas. Responda no seu ritmo — você pode pausar e voltar quando quiser.</p>
        <div className="flex items-center justify-center gap-3 mt-7">
          <Button size="lg" icon={Icon.Sparkles} onClick={onStart}>Iniciar nova sessão</Button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {PHASES.map(p => <Badge key={p.id} color="gray">{p.label}</Badge>)}
        </div>
      </div>
    </div>
  );
}

// ── Chat root ────────────────────────────────────────────────────────────────
function Chat({ showToast, setRoute, newSessionSignal }) {
  const [session, setSession] = React.useState('active');
  const [layout, setLayout] = React.useState('top');
  const [messages, setMessages] = React.useState(SEED);
  const [phase, setPhase] = React.useState('experiencia');
  const [queue, setQueue] = React.useState(0);
  const [waiting, setWaiting] = React.useState(false);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef(null);

  React.useEffect(() => { if (newSessionSignal) startFresh(); }, [newSessionSignal]);

  React.useEffect(() => {
    const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight + 400;
  }, [messages, waiting, layout, session]);

  const lastAssistant = [...messages].reverse().find(m => m.role !== 'user');
  const showSuggestions = !waiting && lastAssistant && lastAssistant.suggestions && messages[messages.length-1] !== undefined && messages[messages.length-1].role !== 'user';
  const canFinalize = pidx(phase) >= pidx('skills');

  const now = () => new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });

  function send(text) {
    setMessages(m => [...m, { role:'user', text, t: now() }]);
    setInput('');
    if (queue >= SCRIPT.length) { return; }
    setWaiting(true);
    const step = SCRIPT[queue];
    setTimeout(() => {
      setWaiting(false);
      setMessages(m => [...m, { ...step, t: now() }]);
      if (step.phase) setPhase(step.phase);
      setQueue(q => q + 1);
    }, 1400 + Math.random()*700);
  }

  function startFresh() {
    setSession('active');
    setMessages([{ role:'assistant', text:'Oi! 👋 Eu sou o entrevistador do Sieve. Vamos montar seu currículo conversando — começo perguntando seus dados básicos. Qual seu nome completo, cidade e e-mail?', t: now() }]);
    setPhase('pessoais'); setQueue(0); setWaiting(false); setInput('');
  }

  function finalize() {
    showToast && showToast({ type:'info', title:'Entrevista finalizada', msg:'Acionando redator → revisor → juiz. Seu currículo aparecerá em Currículos.' });
    setTimeout(() => setRoute && setRoute('resumes'), 1100);
  }

  return (
    <div className="flex flex-col h-full">
      {session === 'none' ? <ChatEmpty onStart={startFresh} /> : (
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            {/* session header */}
            <div className="shrink-0 px-4 md:px-6 py-3 border-b border-gray-2 bg-white/70 backdrop-blur flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <InterviewerAvatar size={38} />
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold text-ink-9 leading-tight flex items-center gap-2">Entrevistador Sieve <Badge color="green" dot>online</Badge></p>
                  <p className="text-[12.5px] text-gray-6">Fase atual: <span className="font-bold text-indigo-7">{PHASES[pidx(phase)].label}</span></p>
                </div>
              </div>
              <Button variant={canFinalize ? 'primary' : 'default'} icon={Icon.Flag} disabled={!canFinalize} onClick={finalize} title={canFinalize ? '' : 'Disponível quando houver dados suficientes'}>Finalizar entrevista</Button>
            </div>

            {layout === 'top' && (
              <div className="shrink-0 border-b border-gray-2 bg-white/40 px-4 md:px-6 py-2.5"><StepperTop current={phase} /></div>
            )}

            {/* messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
              <div className="max-w-[900px] mx-auto flex flex-col gap-5">
                {messages.map((m,i) => <Bubble key={i} m={m} />)}
                {waiting && <TypingBubble />}
                {showSuggestions && <Suggestions items={lastAssistant.suggestions} onPick={send} />}
              </div>
            </div>

            <Composer value={input} setValue={setInput} onSend={send} disabled={waiting} />
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Chat });


// ===== src/resumes.jsx =====
// ════════════════ CURRÍCULOS ════════════════
const RESUME_DATA = {
  name: 'Marina Costa',
  role: 'Desenvolvedora Backend Python',
  contact: ['São Paulo – SP', 'marina.costa@email.com', '(11) 98888-0000', 'linkedin.com/in/marinacosta', 'github.com/marinacosta'],
  resumo: 'Desenvolvedora backend com 4 anos de experiência em Python, especializada em sistemas de pagamento de alta escala. Reduziu latência de APIs críticas em 40% e liderou a migração para arquitetura de microsserviços na Nubank.',
  exp: [
    { role:'Desenvolvedora Backend Pleno', co:'Nubank', period:'2022 – Atual', bullets:[
      'Reduzi a latência da API de pagamentos em 40% otimizando consultas e cache com Redis.',
      'Desenhei e implementei microsserviço que processa 2M de transações/dia com 99.98% de uptime.',
      'Mentora de 2 desenvolvedores júnior em práticas de testes e code review.' ] },
    { role:'Desenvolvedora Backend Júnior', co:'Stone', period:'2020 – 2022', bullets:[
      'Construí integrações REST com adquirentes, reduzindo falhas de conciliação em 25%.',
      'Migrei serviços legados para Django + PostgreSQL com cobertura de testes de 85%.' ] },
  ],
  edu: [{ course:'Bacharelado em Ciência da Computação', org:'Universidade de São Paulo (USP)', year:'2017 – 2021' }],
  skills: ['Python','Django','FastAPI','PostgreSQL','Redis','Docker','AWS','Kubernetes','Pytest','CI/CD'],
  proj: [{ name:'pycli-tasks', desc:'CLI open-source de gestão de tarefas (480★ no GitHub), feita em Python + Typer.' }],
};

const BREAKDOWN = [
  { k:'Verbos de ação', v:9.0 }, { k:'Métricas e resultados', v:8.5 }, { k:'Ausência de clichês', v:7.0 },
  { k:'Especificidade', v:8.8 }, { k:'Concisão', v:8.0 }, { k:'Formatação ATS', v:9.2 },
];
const FEEDBACK = [
  { tone:'green', text:'Excelente uso de métricas quantificáveis na experiência da Nubank.' },
  { tone:'yellow', text:'Evite o termo "responsável por" — prefira verbos de ação diretos.' },
  { tone:'yellow', text:'O resumo poderia citar uma tecnologia-chave a mais para SEO de recrutadores.' },
];
const VERSIONS = [
  { v:'v2', agent:'Pipeline completo', score:8.4, date:'há 2 dias', current:true },
  { v:'v1', agent:'Redator + Revisor', score:7.1, date:'há 5 dias' },
];

function ResumesScreen({ setRoute, showToast }) {
  const [view, setView] = React.useState('list'); // list | detail | diff
  return (
    <Page>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-6">
          <button onClick={() => setView('list')} className={cx(view==='list'?'text-ink-9':'hover:text-ink-9')}>Currículos</button>
          {view!=='list' && <><Icon.ChevronRight size={14} className="text-gray-4" /><span className="text-ink-9">{view==='detail'?'Desenvolvedora Backend Python':'Comparar versões'}</span></>}
        </div>
        <Tabs value={view} onChange={setView} tabs={[
          { value:'list', label:'Lista', icon:Icon.File },
          { value:'detail', label:'Detalhe', icon:Icon.Sparkles },
          { value:'diff', label:'Comparar', icon:Icon.Refresh },
        ]} />
      </div>
      {view==='list' && <ResumesList onOpen={() => setView('detail')} setRoute={setRoute} />}
      {view==='detail' && <ResumeDetail onDiff={() => setView('diff')} showToast={showToast} />}
      {view==='diff' && <ResumeDiff onBack={() => setView('detail')} />}
    </Page>
  );
}

function ResumesList({ onOpen, setRoute }) {
  const [empty, setEmpty] = React.useState(false);
  const cards = [
    { title:'Desenvolvedora Backend Python', target:'Backend Sênior · Python / Django', status:'ready', score:8.4, versions:2, date:'há 2 dias' },
    { title:'Engenheira de Dados', target:'Data Engineer · Pleno', status:'generating', date:'agora' },
    { title:'Tech Lead Backend', target:'Liderança técnica · Python', status:'failed', date:'há 1 semana' },
  ];
  return (
    <div className="fadeup">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-6 text-[14px]">{empty ? 'Nenhum currículo ainda.' : `${cards.length} currículos`}</p>
        <StateToggle value={empty?'empty':'data'} onChange={v=>setEmpty(v==='empty')} options={[{value:'data',label:'Com dados'},{value:'empty',label:'Vazio'}]} />
      </div>
      {empty ? (
        <Card><EmptyState icon={Icon.Chat} title="Nenhum currículo ainda" desc="Inicie uma conversa com o entrevistador e seu primeiro currículo aparece aqui, já avaliado de 0 a 10."
          action={<Button icon={Icon.Sparkles} onClick={() => setRoute('chat')}>Iniciar entrevista</Button>} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c,i) => (
            <Card key={i} hover className="p-5 cursor-pointer flex flex-col" onClick={() => c.status==='ready' && onOpen()}>
              <div className="flex items-start justify-between mb-4">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-b from-indigo-0 to-white ring-1 ring-inset ring-indigo-1 text-indigo-6"><Icon.File size={19} /></span>
                <StatusBadge status={c.status} />
              </div>
              <p className="font-bold text-ink-9 leading-snug">{c.title}</p>
              <p className="text-[13px] text-gray-6 mt-1">{c.target}</p>
              <div className="mt-4 pt-4 border-t border-gray-1 flex items-center justify-between">
                {c.status==='ready' && <div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold text-green-7">{c.score.toFixed(1)}</span><span className="text-gray-4 text-xs font-semibold">/10</span></div>}
                {c.status==='generating' && <span className="inline-flex items-center gap-1.5 text-[12px] text-yellow-7 font-semibold"><span className="w-3.5 h-3.5 border-2 border-yellow-5 border-t-transparent rounded-full animate-spin"/>avaliando…</span>}
                {c.status==='failed' && <button className="text-[12px] font-bold text-red-6 inline-flex items-center gap-1"><Icon.Refresh size={13}/> Tentar de novo</button>}
                <div className="flex items-center gap-2 text-[11.5px] text-gray-5">{c.versions && <Badge color="gray">v{c.versions}</Badge>}{c.date}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Detail with ready / generating / failed states ──
function ResumeDetail({ onDiff, showToast }) {
  const [state, setState] = React.useState('ready');
  return (
    <div className="fadeup">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold text-ink-9 tracking-tight">Desenvolvedora Backend Python</h1>
          <p className="text-gray-6 mt-1 text-[14px]">Cargo-alvo: Backend Sênior · Python / Django</p>
        </div>
        <StateToggle value={state} onChange={setState} options={[{value:'ready',label:'Pronto'},{value:'generating',label:'Gerando'},{value:'failed',label:'Falhou'}]} />
      </div>
      {state==='ready' && <DetailReady onDiff={onDiff} showToast={showToast} />}
      {state==='generating' && <DetailGenerating />}
      {state==='failed' && <DetailFailed onRetry={() => setState('generating')} />}
    </div>
  );
}

function A4Preview({ skeleton }) {
  if (skeleton) {
    return (
      <div className="bg-white rounded-card border border-gray-2 shadow-card p-8 md:p-10">
        <Skeleton className="h-7 w-52 mb-2" /><Skeleton className="h-3 w-72 mb-6" />
        {[0,1,2].map(i => (<div key={i} className="mb-6"><Skeleton className="h-3.5 w-32 mb-3" />
          <Skeleton className="h-2.5 w-full mb-2" /><Skeleton className="h-2.5 w-[92%] mb-2" /><Skeleton className="h-2.5 w-[80%]" /></div>))}
      </div>
    );
  }
  const d = RESUME_DATA;
  return (
    <div className="bg-white rounded-card border border-gray-2 shadow-card overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-indigo-5 to-indigo-7" />
      <div className="p-8 md:p-10 text-ink-8">
        <h2 className="text-[24px] font-extrabold text-ink-9 tracking-tight">{d.name}</h2>
        <p className="text-indigo-7 font-bold text-[14px] mt-0.5">{d.role}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[12px] text-gray-6">
          {d.contact.map((c,i) => <span key={i} className="inline-flex items-center gap-1.5">{i>0 && <span className="w-1 h-1 rounded-full bg-gray-3" />}{c}</span>)}
        </div>
        <DocSection title="Resumo profissional"><p className="text-[13px] leading-relaxed">{d.resumo}</p></DocSection>
        <DocSection title="Experiência">
          {d.exp.map((e,i) => (
            <div key={i} className={i>0?'mt-4':''}>
              <div className="flex items-baseline justify-between"><p className="font-bold text-ink-9 text-[13.5px]">{e.role} · <span className="text-indigo-7">{e.co}</span></p><span className="text-[11.5px] text-gray-5 font-medium shrink-0">{e.period}</span></div>
              <ul className="mt-1.5 space-y-1">{e.bullets.map((b,j) => <li key={j} className="text-[12.5px] leading-relaxed flex gap-2"><span className="text-indigo-5 mt-1.5 w-1 h-1 rounded-full bg-indigo-5 shrink-0" />{b}</li>)}</ul>
            </div>
          ))}
        </DocSection>
        <DocSection title="Formação">{d.edu.map((e,i)=>(<div key={i} className="flex items-baseline justify-between"><p className="font-bold text-ink-9 text-[13.5px]">{e.course}<span className="font-normal text-gray-6"> — {e.org}</span></p><span className="text-[11.5px] text-gray-5 shrink-0">{e.year}</span></div>))}</DocSection>
        <DocSection title="Skills"><div className="flex flex-wrap gap-1.5">{d.skills.map(s => <span key={s} className="text-[12px] font-semibold text-ink-8 bg-gray-1 border border-gray-2 rounded-md px-2 py-0.5">{s}</span>)}</div></DocSection>
        <DocSection title="Projetos">{d.proj.map((p,i)=>(<div key={i}><p className="font-bold text-ink-9 text-[13.5px]">{p.name}</p><p className="text-[12.5px] leading-relaxed mt-0.5">{p.desc}</p></div>))}</DocSection>
      </div>
    </div>
  );
}
function DocSection({ title, children }) {
  return <div className="mt-6 pt-5 border-t border-gray-1"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-indigo-6 mb-2.5">{title}</p>{children}</div>;
}

function DetailReady({ onDiff, showToast }) {
  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
      <A4Preview />
      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <Card className="p-6 flex flex-col items-center">
          <ScoreGauge score={8.4} max={10} size={150} />
          <p className="text-[13px] text-gray-6 mt-3 text-center">Avaliado pelo agente <strong className="text-ink-8 font-semibold">Juiz</strong> · pipeline completo</p>
          <Button full icon={Icon.Download} className="mt-4" onClick={() => showToast({type:'success',title:'Exportando PDF',msg:'Seu currículo ATS-safe foi baixado.'})}>Exportar PDF</Button>
        </Card>
        <Card className="p-5">
          <SectionLabel>Breakdown do score</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {BREAKDOWN.map(b => {
              const tone = b.v>=7.5?'green':b.v>=5?'yellow':'red';
              return (<div key={b.k} className="flex items-center gap-3">
                <span className="text-[12.5px] text-gray-7 w-[120px] shrink-0">{b.k}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-1 overflow-hidden"><div className={cx('h-full rounded-full', tone==='green'?'bg-green-5':tone==='yellow'?'bg-yellow-5':'bg-red-5')} style={{width:`${b.v*10}%`}} /></div>
                <span className="font-mono text-[12px] font-semibold text-ink-8 w-7 text-right tnum">{b.v.toFixed(1)}</span>
              </div>);
            })}
          </div>
        </Card>
        <Card className="p-5">
          <SectionLabel>Feedback acionável</SectionLabel>
          <ul className="flex flex-col gap-2.5">
            {FEEDBACK.map((f,i) => (<li key={i} className="flex gap-2.5 text-[13px] leading-snug">
              <span className={cx('mt-0.5 shrink-0', f.tone==='green'?'text-green-6':'text-yellow-6')}>{f.tone==='green'?<Icon.CheckCircle size={16}/>:<Icon.Lightbulb size={16}/>}</span>
              <span className="text-gray-7">{f.text}</span></li>))}
          </ul>
        </Card>
        <Card className="p-5">
          <SectionLabel right={<button onClick={onDiff} className="text-[12.5px] font-bold text-indigo-7 hover:text-indigo-8 inline-flex items-center gap-1"><Icon.Refresh size={13}/> Comparar</button>}>Versões</SectionLabel>
          <div className="flex flex-col gap-2">
            {VERSIONS.map(v => (
              <div key={v.v} className={cx('flex items-center gap-3 rounded-xl px-3 py-2.5 border', v.current?'border-indigo-2 bg-indigo-0':'border-gray-2')}>
                <span className={cx('font-mono font-bold text-[13px] w-7', v.current?'text-indigo-7':'text-gray-6')}>{v.v}</span>
                <div className="min-w-0 flex-1"><p className="text-[12.5px] font-semibold text-ink-8 truncate">{v.agent}</p><p className="text-[11px] text-gray-5">{v.date}</p></div>
                <span className={cx('font-mono text-[13px] font-semibold tnum', v.score>=7.5?'text-green-7':'text-yellow-7')}>{v.score.toFixed(1)}</span>
                {v.current && <Badge color="indigo">atual</Badge>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const PIPELINE = [
  { k:'writing', label:'Redigindo', agent:'Agente Redator', icon:Icon.PenLine },
  { k:'reviewing', label:'Revisando', agent:'Agente Revisor', icon:Icon.Search },
  { k:'judging', label:'Avaliando', agent:'Agente Juiz', icon:Icon.Stars },
];
function DetailGenerating() {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    if (step >= PIPELINE.length) return;
    const id = setTimeout(() => setStep(s => s + 1), 2200);
    return () => clearTimeout(id);
  }, [step]);
  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
      <A4Preview skeleton />
      <Card className="p-6 lg:sticky lg:top-4">
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-yellow-5 animate-pulse" /><span className="text-[11px] font-bold uppercase tracking-[.12em] text-yellow-7">Gerando currículo</span></div>
        <p className="text-[14px] text-gray-6 mb-5">Um time de 3 agentes está construindo e avaliando seu currículo.</p>
        <div className="relative flex flex-col gap-1">
          <span className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gray-2" />
          {PIPELINE.map((p,i) => {
            const done = i < step, active = i === step;
            return (
              <div key={p.k} className={cx('relative flex items-center gap-3 rounded-xl px-2.5 py-3 transition-all', active && 'bg-yellow-1/60')}>
                <span className={cx('relative z-10 grid place-items-center w-10 h-10 rounded-xl shrink-0 transition-all',
                  done?'bg-green-6 text-white':active?'bg-yellow-5 text-white':'bg-white text-gray-4 ring-1 ring-gray-3')}>
                  {done?<Icon.Check size={18}/>:active?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<p.icon size={17}/>}
                </span>
                <div><p className={cx('text-[14px] font-bold', done?'text-green-7':active?'text-yellow-8':'text-gray-5')}>{p.label}</p><p className="text-[12px] text-gray-5">{p.agent}</p></div>
                {done && <Icon.Check size={16} className="ml-auto text-green-6" />}
              </div>
            );
          })}
        </div>
        {step >= PIPELINE.length && <div className="mt-5 rounded-xl bg-green-0 ring-1 ring-inset ring-green-1 px-4 py-3 flex items-center gap-2.5 fadeup"><Icon.CheckCircle size={18} className="text-green-6"/><span className="text-[13px] font-semibold text-green-8">Currículo pronto — nota 8.4</span></div>}
      </Card>
    </div>
  );
}

function DetailFailed({ onRetry }) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        <span className="grid place-items-center w-16 h-16 rounded-2xl bg-red-0 ring-1 ring-inset ring-red-1 text-red-6 mb-5"><Icon.Alert size={28}/></span>
        <h3 className="text-xl font-bold text-ink-9">Não foi possível gerar o currículo</h3>
        <p className="text-gray-6 mt-2 text-[14px] leading-relaxed">O agente revisor encontrou um erro ao processar suas respostas. Nenhum dado foi perdido — você pode tentar novamente agora.</p>
        <div className="flex items-center gap-2 mt-6"><Button icon={Icon.Refresh} onClick={onRetry}>Tentar novamente</Button><Button variant="default">Falar com suporte</Button></div>
      </div>
    </Card>
  );
}

// ── Diff between versions ──
const DIFF = [
  { type:'mod', section:'Resumo', v1:'Desenvolvedora backend com experiência em Python e sistemas de pagamento.', v2:'Desenvolvedora backend com 4 anos de experiência em Python, especializada em sistemas de pagamento de alta escala. Reduziu latência de APIs críticas em 40%.' },
  { type:'add', section:'Experiência · Nubank', v2:'Desenhei e implementei microsserviço que processa 2M de transações/dia com 99.98% de uptime.' },
  { type:'mod', section:'Experiência · Nubank', v1:'Responsável por melhorar o sistema de pagamentos.', v2:'Reduzi a latência da API de pagamentos em 40% otimizando consultas e cache com Redis.' },
  { type:'rem', section:'Experiência · Stone', v1:'Trabalhei com diversas tecnologias e ajudei o time em várias tarefas.' },
  { type:'add', section:'Projetos', v2:'pycli-tasks — CLI open-source de gestão de tarefas (480★ no GitHub).' },
];
function ResumeDiff({ onBack }) {
  const toneMap = {
    add:{ chip:'green', label:'Adicionado', bg:'bg-green-0', ring:'ring-green-1', text:'text-green-8' },
    rem:{ chip:'red', label:'Removido', bg:'bg-red-0', ring:'ring-red-1', text:'text-red-7' },
    mod:{ chip:'yellow', label:'Modificado', bg:'bg-yellow-1/50', ring:'ring-yellow-2', text:'text-yellow-8' },
  };
  return (
    <div className="fadeup">
      <Card className="p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="grid place-items-center w-9 h-9 rounded-lg text-gray-6 hover:bg-gray-1 transition-colors"><Icon.ChevronRight size={18} className="rotate-180"/></button>
          <div className="flex items-center gap-2">
            <select className="h-9 px-3 rounded-lg bg-white border border-gray-3 text-[13px] font-semibold text-ink-9 outline-none"><option>v1 · Redator + Revisor (7.1)</option></select>
            <Icon.ArrowRight size={16} className="text-gray-4" />
            <select className="h-9 px-3 rounded-lg bg-white border border-gray-3 text-[13px] font-semibold text-ink-9 outline-none"><option>v2 · Pipeline completo (8.4)</option></select>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-green-7"><span className="w-2.5 h-2.5 rounded bg-green-4"/>Adicionado</span>
          <span className="inline-flex items-center gap-1.5 text-yellow-7"><span className="w-2.5 h-2.5 rounded bg-yellow-4"/>Modificado</span>
          <span className="inline-flex items-center gap-1.5 text-red-6"><span className="w-2.5 h-2.5 rounded bg-red-4"/>Removido</span>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {['v1','v2'].map(col => (
          <div key={col}>
            <div className="flex items-center gap-2 mb-3 sticky top-0">
              <Badge color={col==='v1'?'gray':'indigo'}>{col}</Badge>
              <span className="text-[13px] font-bold text-ink-9">{col==='v1'?'Redator + Revisor · 7.1':'Pipeline completo · 8.4'}</span>
            </div>
            <Card className="p-5 flex flex-col gap-3">
              {DIFF.map((d,i) => {
                const content = col==='v1' ? d.v1 : d.v2;
                const show = col==='v1' ? (d.type!=='add') : (d.type!=='rem');
                const t = toneMap[d.type];
                if (!show) return <div key={i} className="rounded-lg border border-dashed border-gray-2 px-3 py-2.5 text-[12px] text-gray-4 italic">— {d.type==='add'?'(adicionado na v2)':'(removido)'} —</div>;
                const highlight = (col==='v2' && (d.type==='add'||d.type==='mod')) || (col==='v1' && d.type==='rem');
                return (
                  <div key={i} className={cx('rounded-xl px-3.5 py-3 ring-1 ring-inset', highlight ? cx(t.bg, t.ring) : 'bg-gray-0 ring-gray-2')}>
                    <div className="flex items-center justify-between mb-1.5"><span className="text-[10.5px] font-bold uppercase tracking-wider text-gray-5">{d.section}</span>{highlight && <Badge color={t.chip}>{t.label}</Badge>}</div>
                    <p className={cx('text-[12.5px] leading-relaxed', d.type==='rem'&&col==='v1'?'text-red-7 line-through':'text-gray-7')}>{content}</p>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ResumesScreen });


// ===== src/jobs.jsx =====
// ════════════════ VAGAS — Análise de match ════════════════
const SAMPLE_JD = `Buscamos Pessoa Desenvolvedora Backend Sênior (Python) para o time de pagamentos.

Requisitos:
- 5+ anos com Python e frameworks web (Django ou FastAPI)
- Experiência com PostgreSQL e modelagem de dados
- Mensageria (Kafka ou RabbitMQ) e arquitetura de microsserviços
- Observabilidade (Datadog, Prometheus)
- Inglês técnico

Diferenciais: Go, Kubernetes, experiência em fintech.`;

const MATCH = {
  score: 82,
  have: ['Python','Django','FastAPI','PostgreSQL','Microsserviços','Docker','AWS','CI/CD'],
  missing: [{ s:'Kafka / RabbitMQ', critical:true }, { s:'Datadog / Prometheus', critical:true }, { s:'Go', critical:false }, { s:'Inglês técnico', critical:false }],
  recs: [
    'Adicione experiência com mensageria — mesmo que em projeto pessoal com RabbitMQ.',
    'Cite ferramentas de observabilidade que você já tocou (logs, métricas).',
    'Destaque os 4 anos na Nubank em fintech, alinhado ao diferencial da vaga.',
  ],
};
const ANALYZED = [
  { co:'Nubank', role:'Engenheira de Software Backend', score:88, date:'há 2 dias' },
  { co:'Stone', role:'Desenvolvedora Python Pleno', score:76, date:'há 4 dias' },
  { co:'iFood', role:'Data Engineer', score:54, date:'há 1 semana' },
];

function JobsScreen({ showToast, setRoute }) {
  const [tab, setTab] = React.useState('new');
  return (
    <Page>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-indigo-6 mb-1.5">Matching com vagas</p>
          <h1 className="text-[24px] font-extrabold text-ink-9 tracking-tight">Vagas</h1>
        </div>
        <Tabs value={tab} onChange={setTab} tabs={[
          { value:'new', label:'Analisar vaga', icon:Icon.Sparkles },
          { value:'list', label:'Analisadas', icon:Icon.Briefcase, count:ANALYZED.length },
        ]} />
      </div>
      {tab==='new' ? <JobAnalyzer showToast={showToast} /> : <JobsAnalyzed onNew={() => setTab('new')} />}
    </Page>
  );
}

function JobAnalyzer({ showToast }) {
  const [phase, setPhase] = React.useState('form'); // form | analyzing | result
  const [optimizing, setOptimizing] = React.useState(false);
  const [jd, setJd] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [company, setCompany] = React.useState('');

  function analyze() {
    if (!jd.trim()) return;
    setPhase('analyzing');
    setTimeout(() => setPhase('result'), 2200);
  }
  function optimize() {
    setOptimizing(true);
    setTimeout(() => { setOptimizing(false); showToast({ type:'success', title:'Currículo otimizado', msg:'Versão v3 criada e ajustada para esta vaga (ATS-aware).' }); }, 2400);
  }

  return (
    <div className="grid lg:grid-cols-[440px_1fr] gap-6 items-start fadeup">
      {/* Form */}
      <Card className="p-6 lg:sticky lg:top-4">
        <SectionLabel>Descrição da vaga</SectionLabel>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Título da vaga"><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Backend Sênior" /></Field>
            <Field label="Empresa"><Input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Nubank" /></Field>
          </div>
          <Field label="Cole a descrição completa" hint="Quanto mais completa, melhor o matching.">
            <Textarea rows={9} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Cole aqui o texto da vaga…" />
          </Field>
          <div className="flex items-center gap-2">
            <Button full size="lg" icon={Icon.Sparkles} loading={phase==='analyzing'} disabled={!jd.trim()} onClick={analyze}>{phase==='analyzing'?'Analisando…':'Analisar aderência'}</Button>
            {!jd && <button onClick={()=>setJd(SAMPLE_JD)} className="shrink-0 text-[12px] font-bold text-indigo-7 hover:text-indigo-8 whitespace-nowrap">Usar exemplo</button>}
          </div>
        </div>
      </Card>

      {/* Result panel */}
      {phase==='form' && <Card className="min-h-[420px] flex items-center"><EmptyState icon={Icon.Briefcase} title="Cole uma vaga para começar" desc="O Sieve compara a vaga com seu currículo e mostra o score de aderência, skills que batem e o que falta." /></Card>}
      {phase==='analyzing' && (
        <Card className="min-h-[420px] grid place-items-center">
          <div className="flex flex-col items-center text-center">
            <span className="grid place-items-center w-16 h-16 rounded-2xl text-white mb-5 bg-gradient-to-br from-indigo-5 to-indigo-8" style={{animation:'ringpulse 2s infinite'}}><Icon.Search size={28}/></span>
            <p className="text-[15px] font-bold text-ink-9">Analisando aderência…</p>
            <p className="text-[13px] text-gray-6 mt-1">Comparando requisitos com seu currículo v2</p>
          </div>
        </Card>
      )}
      {phase==='result' && <MatchResult onOptimize={optimize} optimizing={optimizing} />}
    </div>
  );
}

function MatchResult({ onOptimize, optimizing }) {
  return (
    <div className="flex flex-col gap-4 fadeup">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge score={MATCH.score} max={100} size={140} />
          <div className="flex-1 text-center sm:text-left">
            <Badge color="green" dot>Alta aderência</Badge>
            <h3 className="text-xl font-bold text-ink-9 mt-2">Você é um forte candidato</h3>
            <p className="text-gray-6 text-[14px] mt-1.5 leading-relaxed">Seu currículo cobre a maioria dos requisitos. Cobrir 2 skills críticas que faltam pode levar sua aderência acima de 90%.</p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <select className="h-9 px-3 rounded-lg bg-white border border-gray-3 text-[12.5px] font-semibold text-ink-9 outline-none"><option>Comparar com: v2 (8.4)</option><option>v1 (7.1)</option></select>
            </div>
          </div>
        </div>
      </Card>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionLabel right={<Badge color="green">{MATCH.have.length}</Badge>}>Skills que batem</SectionLabel>
          <div className="flex flex-wrap gap-2">{MATCH.have.map(s => <span key={s} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-green-8 bg-green-0 ring-1 ring-inset ring-green-1 rounded-full px-2.5 py-1"><Icon.Check size={13}/>{s}</span>)}</div>
        </Card>
        <Card className="p-5">
          <SectionLabel right={<Badge color="red">{MATCH.missing.length}</Badge>}>Skills que faltam</SectionLabel>
          <div className="flex flex-wrap gap-2">{MATCH.missing.map(m => <span key={m.s} className={cx('inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-2.5 py-1 ring-1 ring-inset', m.critical?'text-red-7 bg-red-0 ring-red-1':'text-gray-7 bg-gray-1 ring-gray-2')}>{m.critical&&<Icon.Alert size={12}/>}{m.s}</span>)}</div>
        </Card>
      </div>
      <Card className="p-5">
        <SectionLabel>Recomendações</SectionLabel>
        <ul className="flex flex-col gap-2.5">{MATCH.recs.map((r,i)=>(<li key={i} className="flex gap-2.5 text-[13.5px] leading-snug"><span className="grid place-items-center w-5 h-5 rounded-full bg-indigo-0 text-indigo-7 text-[11px] font-bold shrink-0 mt-0.5">{i+1}</span><span className="text-gray-7">{r}</span></li>))}</ul>
      </Card>
      <Card className="p-5 bg-gradient-to-br from-indigo-0 to-white border-indigo-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><p className="font-bold text-ink-9 flex items-center gap-2"><Icon.Sparkles size={16} className="text-indigo-6"/> Otimizar para esta vaga</p><p className="text-[13px] text-gray-6 mt-1">Gera uma versão ATS-aware do currículo, sem inventar experiência.</p></div>
          <Button size="lg" icon={Icon.Sparkles} loading={optimizing} onClick={onOptimize} className="shrink-0">{optimizing?'Otimizando…':'Otimizar currículo'}</Button>
        </div>
      </Card>
    </div>
  );
}

function JobsAnalyzed({ onNew }) {
  return (
    <div className="fadeup">
      <div className="flex flex-col gap-3">
        {ANALYZED.map((j,i) => (
          <Card key={i} hover className="p-4 flex items-center gap-4 cursor-pointer">
            <Avatar name={j.co} size={42} gradient="linear-gradient(135deg,#c6bdac,#574f43)" />
            <div className="min-w-0 flex-1"><p className="font-bold text-ink-9 truncate">{j.role}</p><p className="text-[13px] text-gray-6">{j.co} · {j.date}</p></div>
            <div className="flex items-center gap-3 w-44 shrink-0">
              <div className="h-2 flex-1 rounded-full bg-gray-1 overflow-hidden"><div className={cx('h-full rounded-full', j.score>=75?'bg-green-6':j.score>=50?'bg-yellow-5':'bg-red-5')} style={{width:`${j.score}%`}}/></div>
              <span className={cx('font-mono text-[14px] font-semibold tnum w-10 text-right', j.score>=75?'text-green-7':j.score>=50?'text-yellow-7':'text-red-6')}>{j.score}%</span>
            </div>
            <Icon.ChevronRight size={16} className="text-gray-4 shrink-0" />
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { JobsScreen });


// ===== src/kanban.jsx =====
// ════════════════ CANDIDATURAS — Kanban ════════════════
const COLUMNS = [
  { id:'applied', label:'Aplicada', tone:'#7d7464' },
  { id:'screening', label:'Triagem', tone:'#5c7cfa' },
  { id:'tech', label:'Entrevista técnica', tone:'#cf5530' },
  { id:'final', label:'Entrevista final', tone:'#9b59b6' },
  { id:'offer', label:'Oferta', tone:'#37b24d' },
  { id:'rejected', label:'Recusada', tone:'#fa5252' },
];
const SEED_CARDS = [
  { id:'c1', col:'tech', co:'Nubank', role:'Eng. Software Backend', date:'02 jun', ver:'v2', link:true },
  { id:'c2', col:'screening', co:'Stone', role:'Dev Python Pleno', date:'29 mai', ver:'v2', link:true },
  { id:'c3', col:'applied', co:'iFood', role:'Data Engineer', date:'28 mai', ver:'v1', link:false },
  { id:'c4', col:'applied', co:'Mercado Livre', role:'Backend Sr.', date:'27 mai', ver:'v2', link:true },
  { id:'c5', col:'final', co:'PicPay', role:'Tech Lead Backend', date:'21 mai', ver:'v2', link:true },
  { id:'c6', col:'offer', co:'QuintoAndar', role:'Dev Backend Pleno', date:'18 mai', ver:'v2', link:true },
  { id:'c7', col:'rejected', co:'C6 Bank', role:'Engenheira de Dados', date:'12 mai', ver:'v1', link:false },
];
const COMPANY_GRAD = ['linear-gradient(135deg,#e07c52,#b8451f)','linear-gradient(135deg,#5c7cfa,#3b5bdb)','linear-gradient(135deg,#37b24d,#2f9e44)','linear-gradient(135deg,#9b59b6,#7048a8)','linear-gradient(135deg,#c6bdac,#574f43)'];
const gradFor = (s) => COMPANY_GRAD[(s.charCodeAt(0)+s.length) % COMPANY_GRAD.length];

function KanbanScreen({ showToast }) {
  const [cards, setCards] = React.useState(SEED_CARDS);
  const [dragId, setDragId] = React.useState(null);
  const [overCol, setOverCol] = React.useState(null);
  const [modal, setModal] = React.useState(false);

  function onDrop(colId) {
    if (!dragId) return;
    setCards(cs => cs.map(c => c.id === dragId ? { ...c, col: colId } : c));
    setDragId(null); setOverCol(null);
  }
  function addCard(card) {
    setCards(cs => [{ ...card, id:'c'+Date.now(), col:'applied' }, ...cs]);
    setModal(false);
    showToast({ type:'success', title:'Candidatura criada', msg:`${card.role} · ${card.co} adicionada em Aplicada.` });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 lg:px-8 pt-7 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-indigo-6 mb-1.5">Funil de candidaturas</p>
          <h1 className="text-[24px] font-extrabold text-ink-9 tracking-tight">Candidaturas</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-gray-5 font-medium hidden sm:block">{cards.length} no total · arraste entre colunas</span>
          <Button icon={Icon.Plus} onClick={() => setModal(true)}>Nova candidatura</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 lg:px-8 pb-6">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(col => {
            const colCards = cards.filter(c => c.col === col.id);
            const isOver = overCol === col.id;
            return (
              <div key={col.id}
                onDragOver={e => { e.preventDefault(); setOverCol(col.id); }}
                onDragLeave={e => { if (e.currentTarget === e.target) setOverCol(null); }}
                onDrop={() => onDrop(col.id)}
                className={cx('flex flex-col w-[272px] shrink-0 rounded-2xl transition-colors', isOver ? 'bg-indigo-0/70 ring-2 ring-indigo-2' : 'bg-gray-1/50')}>
                <div className="flex items-center gap-2 px-3.5 py-3 border-b-2 rounded-t-2xl" style={{ borderColor: col.tone }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: col.tone }} />
                  <span className="text-[13px] font-bold text-ink-9 flex-1">{col.label}</span>
                  <span className="text-[11px] font-bold tnum text-gray-6 bg-white rounded-full px-2 py-0.5 ring-1 ring-gray-2">{colCards.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5 min-h-[120px]">
                  {colCards.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-8 px-3 rounded-xl border-2 border-dashed border-gray-2/80">
                      <span className="text-gray-4 mb-1"><Icon.Kanban size={20}/></span>
                      <p className="text-[12px] text-gray-5">{isOver ? 'Solte aqui' : 'Vazio'}</p>
                    </div>
                  )}
                  {colCards.map(c => (
                    <KanbanCard key={c.id} c={c} dragging={dragId===c.id}
                      onDragStart={() => setDragId(c.id)} onDragEnd={() => { setDragId(null); setOverCol(null); }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewApplicationModal open={modal} onClose={() => setModal(false)} onSave={addCard} />
    </div>
  );
}

function KanbanCard({ c, dragging, onDragStart, onDragEnd }) {
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
      className={cx('group bg-white rounded-xl border border-gray-2 shadow-card p-3.5 cursor-grab active:cursor-grabbing transition-all hover:shadow-cardhover hover:-translate-y-0.5',
        dragging && 'opacity-40 rotate-2')}>
      <div className="flex items-start gap-2.5">
        <Avatar name={c.co} size={34} gradient={gradFor(c.co)} />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-ink-9 leading-tight truncate">{c.co}</p>
          <p className="text-[12px] text-gray-6 truncate">{c.role}</p>
        </div>
        <Icon.GripV size={16} className="text-gray-3 group-hover:text-gray-4 shrink-0" />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-5 font-medium"><Icon.Calendar size={12}/>{c.date}</span>
        <div className="flex items-center gap-1.5">
          {c.link && <span className="grid place-items-center w-5 h-5 rounded text-gray-5 hover:text-indigo-6"><Icon.Link size={12}/></span>}
          <Badge color="indigo">{c.ver}</Badge>
        </div>
      </div>
    </div>
  );
}

function NewApplicationModal({ open, onClose, onSave }) {
  const [f, setF] = React.useState({ co:'', role:'', link:'', date:'', notes:'', ver:'v2' });
  const set = (k,v) => setF(p => ({ ...p, [k]:v }));
  const valid = f.co.trim() && f.role.trim();
  return (
    <Modal open={open} onClose={onClose} title="Nova candidatura" width={560}
      footer={<><Button variant="default" onClick={onClose}>Cancelar</Button><Button disabled={!valid} icon={Icon.Plus} onClick={() => onSave({ co:f.co, role:f.role, link:!!f.link, date:f.date||'hoje', ver:f.ver })}>Adicionar</Button></>}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Empresa"><Input value={f.co} onChange={e=>set('co',e.target.value)} placeholder="Nubank" /></Field>
          <Field label="Cargo"><Input value={f.role} onChange={e=>set('role',e.target.value)} placeholder="Backend Sênior" /></Field>
        </div>
        <Field label="Link da vaga" hint="Opcional"><Input value={f.link} onChange={e=>set('link',e.target.value)} placeholder="https://…" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data da aplicação"><Input type="date" value={f.date} onChange={e=>set('date',e.target.value)} /></Field>
          <Field label="Versão do currículo">
            <select value={f.ver} onChange={e=>set('ver',e.target.value)} className={inputCls}><option value="v2">v2 · Pipeline (8.4)</option><option value="v1">v1 · Redator + Revisor (7.1)</option></select>
          </Field>
        </div>
        <Field label="Notas" hint="Opcional"><Textarea rows={3} value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Recrutadora: Ana · referência do João…" /></Field>
      </div>
    </Modal>
  );
}

Object.assign(window, { KanbanScreen });


// ===== src/profile.jsx =====
// ════════════════ PERFIL + FOTO PROFISSIONAL ════════════════
function StripePlaceholder({ label, tone = 'gray', className }) {
  const id = React.useRef(uid()).current;
  const c = tone === 'indigo' ? ['#fadfd1','#f4c1a6','#cf5530'] : ['#e8e3d9','#dbd4c7','#7d7464'];
  return (
    <div className={cx('relative overflow-hidden rounded-xl grid place-items-center', className)}>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs><pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill={c[0]} /><rect width="7" height="14" fill={c[1]} /></pattern></defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <div className="relative flex flex-col items-center gap-2">
        <span className={cx('grid place-items-center w-12 h-12 rounded-full bg-white/80', tone==='indigo'?'text-indigo-6':'text-gray-6')}><Icon.User size={24}/></span>
        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-white/80 text-gray-7">{label}</span>
      </div>
    </div>
  );
}

function ProfileScreen({ showToast }) {
  const [saving, setSaving] = React.useState(false);
  const [f, setF] = React.useState({ headline:'Desenvolvedora Backend Python · Pagamentos', loc:'São Paulo, SP', phone:'(11) 98888-0000', linkedin:'linkedin.com/in/marinacosta', github:'github.com/marinacosta' });
  const set = (k,v) => setF(p => ({ ...p, [k]:v }));
  function save() { setSaving(true); setTimeout(() => { setSaving(false); showToast({ type:'success', title:'Perfil salvo', msg:'Suas informações foram atualizadas.' }); }, 1200); }

  return (
    <Page>
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-indigo-6 mb-1.5">Sua conta</p>
        <h1 className="text-[24px] font-extrabold text-ink-9 tracking-tight">Perfil</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Profile data */}
        <Card className="p-6">
          <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-2">
            <Avatar name="Marina Costa" size={56} ring />
            <div><p className="text-[17px] font-bold text-ink-9">Marina Costa</p><p className="text-[13px] text-gray-6">marina.costa@email.com</p></div>
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Headline"><Input value={f.headline} onChange={e=>set('headline',e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Localização"><Input value={f.loc} onChange={e=>set('loc',e.target.value)} /></Field>
              <Field label="Telefone"><Input value={f.phone} onChange={e=>set('phone',e.target.value)} /></Field>
            </div>
            <Field label="LinkedIn"><Input value={f.linkedin} onChange={e=>set('linkedin',e.target.value)} /></Field>
            <Field label="GitHub"><Input value={f.github} onChange={e=>set('github',e.target.value)} /></Field>
            <div className="flex justify-end pt-1"><Button icon={Icon.Check} loading={saving} onClick={save}>{saving?'Salvando…':'Salvar alterações'}</Button></div>
          </div>
        </Card>

        {/* Professional photo */}
        <PhotoStudio showToast={showToast} />
      </div>
    </Page>
  );
}

function PhotoStudio({ showToast }) {
  const [phase, setPhase] = React.useState('upload'); // upload | preview | generating | result | error
  const [drag, setDrag] = React.useState(false);

  function upload() { setPhase('preview'); }
  function generate() {
    setPhase('generating');
    setTimeout(() => setPhase('result'), 2600);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-1">
        <SectionLabel>Foto profissional</SectionLabel>
        <StateToggle value={phase==='error'?'error':'flow'} onChange={v=>setPhase(v==='error'?'error':'upload')} options={[{value:'flow',label:'Fluxo'},{value:'error',label:'Erro'}]} />
      </div>
      <p className="text-[13px] text-gray-6 mb-5">Gere uma foto estilo LinkedIn a partir de uma selfie.</p>

      {phase==='upload' && (
        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);upload();}}
          onClick={upload}
          className={cx('cursor-pointer rounded-2xl border-2 border-dashed grid place-items-center text-center py-14 px-6 transition-all', drag?'border-indigo-4 bg-indigo-0':'border-gray-3 hover:border-gray-4 hover:bg-gray-0')}>
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-indigo-0 text-indigo-6 mb-4"><Icon.Upload size={26}/></span>
          <p className="text-[14px] font-bold text-ink-9">Arraste uma selfie ou clique para enviar</p>
          <p className="text-[12.5px] text-gray-5 mt-1">JPG ou PNG · até 5 MB · rosto bem iluminado e centralizado</p>
        </div>
      )}

      {phase==='preview' && (
        <div className="fadeup">
          <StripePlaceholder label="selfie enviada" className="w-full aspect-square max-w-[240px] mx-auto" />
          <div className="flex items-center justify-center gap-2 mt-5">
            <Button variant="default" onClick={()=>setPhase('upload')}>Trocar foto</Button>
            <Button icon={Icon.Sparkles} onClick={generate}>Gerar foto profissional</Button>
          </div>
        </div>
      )}

      {phase==='generating' && (
        <div className="grid place-items-center py-10 fadeup">
          <span className="grid place-items-center w-16 h-16 rounded-2xl text-white mb-5 bg-gradient-to-br from-indigo-5 to-indigo-8" style={{animation:'ringpulse 2s infinite'}}><Icon.Sparkles size={28}/></span>
          <p className="text-[15px] font-bold text-ink-9">Gerando sua foto…</p>
          <p className="text-[13px] text-gray-6 mt-1">Isso leva de 15 a 30 segundos</p>
          <div className="h-1.5 w-48 rounded-full bg-gray-1 overflow-hidden mt-4"><div className="h-full bg-indigo-6 rounded-full" style={{width:'70%',transition:'width 2.4s linear'}}/></div>
        </div>
      )}

      {phase==='result' && (
        <div className="fadeup">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-gray-5 mb-2 text-center">Antes</p><StripePlaceholder label="selfie original" className="w-full aspect-square" /></div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-indigo-6 mb-2 text-center">Depois</p><StripePlaceholder tone="indigo" label="foto LinkedIn" className="w-full aspect-square ring-2 ring-indigo-2" /></div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-5">
            <Button variant="default" icon={Icon.Refresh} onClick={()=>setPhase('preview')}>Gerar de novo</Button>
            <Button icon={Icon.Download} onClick={()=>showToast({type:'success',title:'Foto baixada',msg:'Sua foto profissional foi salva.'})}>Baixar</Button>
          </div>
        </div>
      )}

      {phase==='error' && (
        <div className="fadeup rounded-2xl bg-red-0 ring-1 ring-inset ring-red-1 p-8 text-center">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white text-red-6 mb-4 mx-auto ring-1 ring-red-1"><Icon.Alert size={26}/></span>
          <p className="text-[15px] font-bold text-red-8">Rosto não detectado</p>
          <p className="text-[13px] text-red-7/90 mt-1.5 max-w-xs mx-auto">Não conseguimos identificar um rosto na imagem. Tente outra foto, bem iluminada e de frente.</p>
          <Button variant="default" icon={Icon.Upload} className="mt-5" onClick={()=>setPhase('upload')}>Enviar outra foto</Button>
        </div>
      )}
    </Card>
  );
}

Object.assign(window, { ProfileScreen });


// ===== src/login.jsx =====
// ════════════════ LOGIN (fora do AppShell) ════════════════
function Login({ onEnter }) {
  const [err, setErr] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('marina.costa@email.com');
  const [pwd, setPwd] = React.useState('');

  function submit(e) {
    e && e.preventDefault();
    setLoading(true); setErr(false);
    setTimeout(() => { setLoading(false); if (pwd === 'erro') setErr(true); else onEnter(); }, 1300);
  }

  return (
    <div className="min-h-screen w-full flex canvas-bg">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] max-w-[560px] p-12 text-white relative overflow-hidden bg-gradient-to-br from-indigo-6 via-indigo-7 to-ink-9">
        <div className="absolute -right-20 -top-10 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute right-10 bottom-0 w-52 h-52 rounded-full bg-white/5 translate-y-1/3" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid place-items-center w-9 h-9 rounded-[11px] bg-white/15 ring-1 ring-white/20"><Icon.Filter size={19}/></span>
          <span className="font-display text-[22px] font-extrabold">Sieve</span>
        </div>
        <div className="relative">
          <h2 className="font-display text-[34px] font-extrabold leading-tight tracking-tight">Seu currículo profissional, construído por conversa.</h2>
          <p className="text-indigo-1 mt-4 text-[15px] leading-relaxed max-w-sm">Um entrevistador por IA conduz, um time de agentes redige e avalia, e você acompanha cada candidatura — tudo em um só lugar.</p>
          <div className="flex items-center gap-6 mt-8">
            {[['7','fases de entrevista'],['0–10','nota do currículo'],['ATS','otimização']].map(([n,l])=>(
              <div key={l}><p className="font-mono text-2xl font-semibold">{n}</p><p className="text-[12px] text-indigo-1 mt-0.5">{l}</p></div>
            ))}
          </div>
        </div>
        <p className="relative text-[12px] text-indigo-1/80">© 2026 Sieve · feito para candidatos brasileiros</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] fadeup">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <span className="grid place-items-center w-9 h-9 rounded-[11px] text-white bg-gradient-to-br from-indigo-5 to-indigo-8"><Icon.Filter size={19}/></span>
            <span className="font-display text-[22px] font-extrabold text-ink-9">Sieve</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-ink-9 tracking-tight">Entrar na sua conta</h1>
          <p className="text-gray-6 mt-1.5 text-[14px]">Bem-vinda de volta! Continue construindo sua carreira.</p>

          {err && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-red-0 ring-1 ring-inset ring-red-1 px-4 py-3 fadein">
              <Icon.Alert size={18} className="text-red-6 mt-0.5 shrink-0" />
              <p className="text-[13px] text-red-7 leading-snug"><strong className="font-bold">Credenciais inválidas.</strong> Verifique seu e-mail e senha e tente novamente.</p>
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4 mt-6">
            <Field label="E-mail">
              <div className="relative"><Icon.Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-5" />
                <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="!pl-10" placeholder="voce@email.com" /></div>
            </Field>
            <Field label="Senha">
              <div className="relative"><Icon.Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-5" />
                <Input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} className="!pl-10" placeholder="••••••••" /></div>
            </Field>
            <div className="flex justify-end -mt-1"><a href="#" onClick={e=>e.preventDefault()} className="text-[13px] font-bold text-indigo-7 hover:text-indigo-8">Esqueci minha senha</a></div>
            <Button type="submit" size="lg" full loading={loading} onClick={submit}>{loading ? 'Entrando…' : 'Entrar'}</Button>
          </form>

          <div className="flex items-center gap-3 my-6"><span className="h-px flex-1 bg-gray-2" /><span className="text-[12px] text-gray-5 font-medium">ou</span><span className="h-px flex-1 bg-gray-2" /></div>
          <Button variant="default" full size="lg" icon={Icon.Globe}>Continuar com Google</Button>
          <p className="text-center text-[13px] text-gray-6 mt-6">Não tem conta? <a href="#" onClick={e=>e.preventDefault()} className="font-bold text-indigo-7 hover:text-indigo-8">Criar conta grátis</a></p>
          <p className="text-center text-[11.5px] text-gray-4 mt-4">Dica do protótipo: digite <span className="font-mono">erro</span> na senha para ver o estado de erro.</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Login });


// ===== src/app.jsx =====
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "texture": true,
  "glow": true
}/*EDITMODE-END*/;

function App() {
  const [route, setRoute] = React.useState('home');
  const [authed, setAuthed] = React.useState(true);
  const [toast, setToast] = React.useState(null);
  const [newSig, setNewSig] = React.useState(0);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('theme-dark', !!t.dark);
    el.classList.toggle('no-texture', !t.texture);
    el.classList.toggle('no-glow', !t.glow);
  }, [t.dark, t.texture, t.glow]);

  const showToast = (tt) => { setToast(tt); clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(null), 3600); };
  const newInterview = () => { setRoute('chat'); setNewSig(s => s + 1); };

  if (!authed) {
    return (<><Login onEnter={() => { setAuthed(true); setRoute('home'); }} /><Toast toast={toast} />{tweaksPanel()}</>);
  }

  let view;
  switch (route) {
    case 'home':    view = <Dashboard setRoute={setRoute} showToast={showToast} />; break;
    case 'chat':    view = <Chat setRoute={setRoute} showToast={showToast} newSessionSignal={newSig} />; break;
    case 'resumes': view = <ResumesScreen setRoute={setRoute} showToast={showToast} />; break;
    case 'jobs':    view = <JobsScreen setRoute={setRoute} showToast={showToast} />; break;
    case 'apps':    view = <KanbanScreen showToast={showToast} />; break;
    case 'profile': view = <ProfileScreen showToast={showToast} />; break;
    default:        view = <Placeholder route={route} setRoute={setRoute} />;
  }

  function tweaksPanel() {
    return (
      <TweaksPanel title="Tweaks">
        <TweakSection label="Aparência" />
        <TweakToggle label="Modo escuro" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakSection label="Plano de fundo" />
        <TweakToggle label="Textura de pontos" value={t.texture} onChange={(v) => setTweak('texture', v)} />
        <TweakToggle label="Brilho no topo" value={t.glow} onChange={(v) => setTweak('glow', v)} />
      </TweaksPanel>
    );
  }

  return (
    <>
      <AppShell route={route} setRoute={setRoute} onNewInterview={newInterview} onLogout={() => setAuthed(false)}>{view}</AppShell>
      <Toast toast={toast} />
      {tweaksPanel()}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

