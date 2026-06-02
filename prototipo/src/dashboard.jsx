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
