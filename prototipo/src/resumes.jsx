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
