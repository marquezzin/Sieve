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
