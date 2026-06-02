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
