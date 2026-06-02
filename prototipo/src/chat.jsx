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
