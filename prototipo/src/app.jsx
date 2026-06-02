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
