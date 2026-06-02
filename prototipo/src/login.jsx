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
