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
