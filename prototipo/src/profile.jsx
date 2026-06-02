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
