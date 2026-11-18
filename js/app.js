/* Spa PetFeliz · navegação e orçamento pelo WhatsApp */
(function () {
  'use strict';

  const WA_NUMBER = '5562995766247';
  const WA_DIRECT = 'https://wa.me/' + WA_NUMBER;

  const SVC = {
    banho: { title: 'Banho e Tosa', desc: 'Banho, tosas, unhas e desembolo' },
    creche: { title: 'Creche · Day care', desc: 'Diária avulsa ou pacotes semanais' },
    hotel: { title: 'Hotel', desc: 'Hospedagem para quando você viajar' },
  };
  const KEYS = ['banho', 'creche', 'hotel'];
  const DETAIL = {
    banho: { photo: 'imagens/foto-banho3.jpeg', alt: 'Shih tzu tosado com laço', pos: 'center 12%',
      long: 'Banho com produtos próprios para pets, secagem cuidadosa e acabamento caprichado, para todos os portes.',
      bullets: ['Banho do pequeno ao gigante porte', 'Tosa higiênica, na máquina, na tesoura, da raça e tosa bebê', 'Desembolo e corte de unhas', 'Pacote com 4 banhos (unhas e tosa higiênica inclusos)'] },
    creche: { photo: 'imagens/collie-pisci.jpeg', alt: 'Cães brincando na piscina da creche', pos: 'center 40%',
      long: 'Um dia de brincadeiras, socialização e descanso enquanto você trabalha.',
      bullets: ['Day care em diária avulsa', 'Pacotes de 1x a 5x por semana', 'Avaliação prévia para conhecer o pet', 'Vacinas obrigatórias: múltipla (V8/V10), raiva, gripe e giárdia', 'Táxi dog disponível'] },
    hotel: { photo: 'imagens/cachorro-bola.jpeg', alt: 'Labrador com bolinha', pos: 'center 35%',
      long: 'Hospedagem para quando você viajar, com rotina, carinho e atenção individual.',
      bullets: ['Diárias com acompanhamento', 'Atendimento em feriados e fim de ano', 'Condição especial para clientes de pacotes', 'Alimentação e medicação conforme sua orientação', 'Vacinas obrigatórias: múltipla (V8/V10), raiva, gripe e giárdia'] },
  };
  const LABELS = ['Serviço', 'Tutor', 'Pet', 'Quando', 'Revisão'];
  const YN3 = ['Sim', 'Não', 'Não sei'];
  const OPTS = {
    banhoOpts: ['Banho', 'Tosa higiênica', 'Tosa na máquina', 'Tosa na tesoura', 'Tosa da raça', 'Tosa bebê', 'Corte de unha', 'Desembolo', 'Pacote 4 banhos', 'Outros'],
    especial: ['Sim', 'Não'], medicacao: ['Sim', 'Não'],
    refeicoes: ['1x ao dia', '2x ao dia', '3x ao dia', '4x ou mais'],
    comportCaes: ['Sociável', 'Seletivo', 'Não se dá bem', 'Não sei'],
    comportPessoas: ['Sociável', 'Tímido', 'Desconfiado', 'Pode morder'],
    comportBanho: ['Tranquilo no banho', 'Agressivo / pode morder', 'Tem medo', 'Dificuldade durante o banho', 'Medo de secador', 'Não gosta de mexer nas patas'],
    crecheOpt: ['Diária avulsa', '1x por semana', '2x por semana', '3x por semana', '4x por semana', '5x por semana'],
    especie: ['Cão', 'Gato'], sexo: ['Macho', 'Fêmea'], castrado: ['Sim', 'Não'],
    porte: [{ label: 'Pequeno', hint: 'até 10 kg' }, { label: 'Médio', hint: '10 a 25 kg' }, { label: 'Grande', hint: '25 a 45 kg' }, { label: 'Gigante', hint: 'acima de 45 kg' }],
    vermifugado: YN3, antipulgas: YN3,
    vacinas: ['Múltipla (V8/V10)', 'Raiva', 'Gripe', 'Giárdia', 'Nenhuma / não sei'],
    diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    jaCreche: ['Sim', 'Não'],
    temperamento: ['Dócil', 'Brincalhão', 'Tímido', 'Agitado', 'Sociável com outros pets', 'Não gosta de outros pets', 'Medo de secador'],
    avaliacao: ['Sim', 'Ainda não'], horario: ['Manhã', 'Tarde', 'Tanto faz'], levaTraz: ['Sim', 'Não'],
  };
  const MULTI = { banhoOpts: true, temperamento: true, comportBanho: true, vacinas: true, diasSemana: true };
  const VAC_REQ = ['Múltipla (V8/V10)', 'Raiva', 'Gripe', 'Giárdia'];
  const VAC_NONE = 'Nenhuma / não sei';
  const VAC_HINT = 'Obrigatórias: múltipla (V8/V10), raiva, gripe e giárdia. Marque as que estão em dia.';
  const vezes = () => { const m = /^(\d)x/.exec(S.f.crecheOpt || ''); return m ? +m[1] : 0; };
  const PHONE_FIELDS = { telefone: true, emergTel: true };

  const fresh = () => ({ tab: 'inicio', step: 0, sent: false,
    svc: { banho: false, creche: false, hotel: false },
    f: { especie: 'Cão', banhoOpts: [], temperamento: [], comportBanho: [], vacinas: [], diasSemana: [] } });
  let S = fresh();

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $('#app'), scroll = document.scrollingElement, form = $('#form');
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PAW = '<svg width="%s" height="%s" viewBox="0 0 24 24"><use href="#paw"/></svg>';
  const paw = n => PAW.replace(/%s/g, n);

  const phoneMask = v => { const d = v.replace(/\D/g, '').slice(0, 11); if (d.length < 3) return d; if (d.length < 8) return `(${d.slice(0, 2)}) ${d.slice(2)}`; return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`; };
  const fmt = s => { if (!s) return ''; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
  const nights = () => { const { entrada, saida } = S.f; if (!entrada || !saida) return 0; return Math.round((new Date(saida) - new Date(entrada)) / 864e5); };
  const nightsLabel = () => { const n = nights(); return n > 0 ? `${n} diária${n > 1 ? 's' : ''}` : ''; };

  /* ---------- Navegação ---------- */
  function go(tab) {
    S.tab = tab;
    if (tab !== 'agendar') S.sent = false;
    app.dataset.tab = tab;
    app.classList.toggle('is-sent', S.sent);
    $$('[data-tab-link]').forEach(b => b.classList.toggle('on', b.dataset.tabLink === tab));
    scroll.scrollTop = 0;
    if (tab === 'agendar') renderFlow();
  }
  function start(key) {
    S.step = 0; S.sent = false;
    if (key) S.svc[key] = true;
    go('agendar');
  }

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
    const st = e.target.closest('[data-start]'); if (st) { start(st.dataset.start || null); }
  });
  $$('[data-wa-direct]').forEach(a => { a.href = WA_DIRECT; });

  /* ---------- Conteúdo estático ---------- */
  $('#svcList').innerHTML = KEYS.map(k => `
    <button class="svc-row" data-start="${k}">
      <div class="icon-circle">${paw(26)}</div>
      <div class="grow"><div class="t">${SVC[k].title}</div><div class="d">${SVC[k].desc}</div></div>
      <span class="chev">›</span>
    </button>`).join('');

  $('#svcDetail').innerHTML = KEYS.map(k => `
    <article class="svc-card">
      <img src="${DETAIL[k].photo}" alt="${DETAIL[k].alt}" style="object-position:${DETAIL[k].pos}" loading="lazy">
      <div class="body">
        <div class="t">${SVC[k].title}</div>
        <div class="long">${DETAIL[k].long}</div>
        <div class="bullets">${DETAIL[k].bullets.map(b => `<div class="bullet">${paw(16)}<span>${b}</span></div>`).join('')}</div>
        <button class="btn-pink" data-start="${k}">Pedir orçamento · ${SVC[k].title}</button>
      </div>
    </article>`).join('');

  /* ---------- Orçamento ---------- */
  function chips(key, cls = '') {
    const multi = MULTI[key], val = S.f[key];
    return `<div class="chips ${cls}">` + OPTS[key].map(o => {
      const label = typeof o === 'string' ? o : o.label;
      const on = multi ? (val || []).includes(label) : val === label;
      const inner = o.hint ? `<span>${label}</span><small>${o.hint}</small>` : label;
      return `<button type="button" class="chip${on ? ' on' : ''}" data-chip="${key}" data-val="${esc(label)}" aria-pressed="${on}">${inner}</button>`;
    }).join('') + '</div>';
  }
  const input = (k, ph, extra = '') => `<input class="input" data-f="${k}" value="${esc(S.f[k])}" placeholder="${esc(ph)}" ${extra}>`;
  const area = (k, ph, rows = 2) => `<textarea class="input" data-f="${k}" rows="${rows}" placeholder="${esc(ph)}">${esc(S.f[k])}</textarea>`;
  const R = '<span class="req">*</span>';
  const head = (t, sub) => `<div><h2>${t}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</div>`;

  const STEPS = [
    () => {
      const { svc } = S;
      return head('Quais serviços você deseja?', 'Pode escolher mais de um.') +
        `<div class="group" style="gap:10px">` + KEYS.map(k => `
          <button type="button" class="pick${svc[k] ? ' on' : ''}" data-svc="${k}" aria-pressed="${svc[k]}">
            <div class="icon-circle">${paw(24)}</div>
            <div class="grow"><div class="t">${SVC[k].title}</div><div class="d">${SVC[k].desc}</div></div>
            <div class="ck">${svc[k] ? '✓' : ''}</div>
          </button>`).join('') + '</div>' +
        (svc.banho ? `<div class="panel" style="gap:10px"><div class="panel-q">Banho e tosa: qual serviço deseja? ${R}</div>${chips('banhoOpts')}
          ${(S.f.banhoOpts || []).includes('Outros') ? input('banhoOutros', 'Qual outro serviço? *') : ''}</div>` : '') +
        (svc.creche ? `<div class="panel">
          <div class="group" style="gap:10px"><div class="panel-q">Creche: quantas vezes por semana? ${R}</div>${chips('crecheOpt')}</div>
          <div class="group" style="gap:10px"><div class="panel-q">Em quais dias da semana? ${R}</div>
            <span class="hint" style="margin:0">${vezes() ? `Escolha ${vezes()} dia${vezes() > 1 ? 's' : ''}.` : 'Escolha o(s) dia(s) que ele vai frequentar.'}</span>${chips('diasSemana', 'row')}</div>
        </div>` : '') +
        (svc.hotel ? `<div class="note">Hotel: você informa as datas e horários de entrada e retirada na etapa “Quando”.</div>` : '');
    },
    () => head('Sobre você', 'Para a equipe te responder com o orçamento.') +
      `<label class="field"><span>Nome do tutor ${R}</span>${input('tutor', 'Seu nome completo', 'autocomplete="name"')}</label>
       <label class="field"><span>WhatsApp ${R}</span>${input('telefone', '(62) 90000-0000', 'inputmode="tel" autocomplete="tel"')}</label>
       <div class="panel" style="gap:12px">
         <div><div class="panel-q">Contato de emergência ${S.svc.hotel ? R : ''}</div><div class="hint" style="margin:0">Outra pessoa para chamarmos se não conseguirmos falar com você.</div></div>
         ${input('emergNome', 'Nome')}${input('emergTel', 'Telefone', 'inputmode="tel"')}
       </div>`,
    () => {
      const care = S.svc.hotel || S.svc.creche, banho = S.svc.banho, hotel = S.svc.hotel, creche = S.svc.creche;
      const rq = c => c ? R : '';
      const banhoPanel = banho ? `<div class="panel">
           <div class="panel-title">Para o banho e tosa</div>
           <div class="group"><span class="lbl">Como ele se comporta no banho? ${R}</span><span class="hint">Marque tudo que se aplica: agressividade, medo ou dificuldade.</span>${chips('comportBanho')}</div>
         </div>` : '';
      const carePanel = care ? `<div class="panel">
           <div class="panel-title">${hotel && S.svc.creche ? 'Para creche e hotel' : hotel ? 'Para o hotel' : 'Para a creche'}</div>
           <label class="field"><span>Alimentação ${rq(hotel)}</span>${area('alimentacao', 'Marca da ração e quantidade por refeição')}</label>
           ${hotel ? `<div class="group"><span class="lbl">Quantas refeições por dia? ${R}</span>${chips('refeicoes')}</div>` : ''}
           <div class="group"><span class="lbl">É sociável com outros cães? ${R}</span>${chips('comportCaes')}</div>
           <div class="group"><span class="lbl">Comportamento com pessoas ${R}</span>${chips('comportPessoas')}</div>
           ${creche ? `<div class="group"><span class="lbl">Já frequentou creche antes? ${R}</span>${chips('jaCreche', 'row')}</div>` : ''}
           ${hotel ? `<label class="field"><span>Pertences que ele vai levar</span>${area('pertences', 'Ex.: caminha, cobertor, brinquedos, ração, coleira, potes')}</label>` : ''}
           <div class="group"><span class="lbl">Já fez avaliação conosco? ${R}</span><span class="hint">Antes da primeira estadia fazemos uma avaliação para conhecer o pet.</span>${chips('avaliacao', 'row')}</div>
         </div>` : '';
      return head('Sobre o seu pet', 'Quanto mais detalhes, mais certeiro o orçamento.') +
        `<label class="field"><span>Nome do pet ${R}</span>${input('pet', 'Ex.: Mel')}</label>
         <div class="group"><span class="lbl">Espécie</span>${chips('especie')}</div>
         <div class="grid2 wide-left">
           <label class="field"><span>Raça ${R}</span>${input('raca', 'Ex.: Golden, SRD')}</label>
           <label class="field"><span>Idade ${R}</span>${input('idade', 'Ex.: 3 anos')}</label>
         </div>
         <div class="group"><span class="lbl">Porte ${R}</span>${chips('porte', 'porte')}</div>
         <div class="grid2">
           <div class="group"><span class="lbl">Sexo</span>${chips('sexo', 'row')}</div>
           <div class="group"><span class="lbl">Castrado?</span>${chips('castrado', 'row')}</div>
         </div>
         <div class="panel">
           <div class="panel-title">Saúde</div>
           <div class="group"><span class="lbl">Vermifugado? ${R}</span>${chips('vermifugado', 'row')}</div>
           <div class="group"><span class="lbl">Carteira de vacinação: vacinas obrigatórias em dia ${R}</span><span class="hint">${VAC_HINT}${care ? ' Leve a carteira de vacinação no primeiro dia.' : ''}</span>${chips('vacinas')}</div>
           <div class="group"><span class="lbl">Controle de pulgas e carrapatos em dia? ${rq(care)}</span>${chips('antipulgas', 'row')}</div>
           <div class="group"><span class="lbl">Usa alguma medicação? ${rq(hotel)}</span>${chips('medicacao', 'row')}</div>
           ${S.f.medicacao === 'Sim' ? `<label class="field"><span>Qual medicação? ${R}</span>${area('medicacaoDesc', 'Remédio, dose e horários')}</label>` : ''}
           <div class="group"><span class="lbl">Tem problema de saúde, alergia, problema de pele, restrição alimentar ou necessidade especial? ${R}</span>${chips('especial', 'row')}</div>
           ${S.f.especial === 'Sim' ? `<label class="field"><span>Conte pra gente ${R}</span>${area('especialDesc', 'Ex.: alergia a shampoo, dermatite, não pode comer frango, idoso, cardíaco…')}</label>` : ''}
         </div>
         ${banhoPanel}
         <div class="group"><span class="lbl">Temperamento</span><span class="hint">Marque o que combina com seu pet.</span>${chips('temperamento')}</div>
         ${carePanel}`;
    },
    () => {
      const { svc } = S, T = 'style="padding:0 10px;font-size:14px"';
      return head('Quando?', 'A equipe confirma a disponibilidade no WhatsApp.') +
        (svc.banho ? `<div class="panel">
          <div class="panel-title">Banho e tosa</div>
          <label class="field"><span>Melhor dia ${R}</span>${input('data', '', 'type="date"')}</label>
          <div class="group"><span class="lbl">Melhor horário ${R}</span>${chips('horario', 'row')}</div>
        </div>` : '') +
        (svc.creche ? `<div class="panel">
          <div class="panel-title">Creche</div>
          <label class="field"><span>Quer começar a partir de quando? ${R}</span>${input('crecheInicio', '', 'type="date"')}</label>
          <div class="grid2">
            <label class="field"><span>Horário de entrada ${R}</span>${input('crecheEntrada', '', 'type="time" ' + T)}</label>
            <label class="field"><span>Horário de saída ${R}</span>${input('crecheSaida', '', 'type="time" ' + T)}</label>
          </div>
        </div>` : '') +
        (svc.hotel ? `<div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><div class="panel-title">Hospedagem</div><div style="font:800 13px Nunito;color:var(--muted)" id="nights">${nightsLabel()}</div></div>
          <div class="grid2">
            <label class="field"><span>Entrada ${R}</span>${input('entrada', '', 'type="date" style="padding:0 10px;font-size:14px"')}</label>
            <label class="field"><span>Saída ${R}</span>${input('saida', '', 'type="date" style="padding:0 10px;font-size:14px"')}</label>
            <label class="field"><span>Horário de entrada ${R}</span>${input('horaEntrada', '', 'type="time" style="padding:0 10px;font-size:14px"')}</label>
            <label class="field"><span>Horário de retirada ${R}</span>${input('horaSaida', '', 'type="time" style="padding:0 10px;font-size:14px"')}</label>
          </div>
        </div>` : '') +
        `<div class="dark">
          <div><div class="t">Precisa de leva e traz?</div><div class="d">Nosso táxi dog busca e leva seu pet.</div></div>
          ${chips('levaTraz', 'row')}
          ${S.f.levaTraz === 'Sim' ? input('endereco', 'Endereço para busca *', 'autocomplete="street-address"') : ''}
        </div>
        <label class="field"><span>Observações</span>${area('obs', 'Algo mais que a equipe deva saber?', 3)}</label>`;
    },
    () => `<div><div class="script pink" style="font-size:26px">Tudo certo?</div><h2>Confira antes de enviar</h2></div>` +
      sections().filter(s => s.rows.length).map(s => `
        <div class="review">
          <div class="review-head"><div class="t">${s.title}</div><button type="button" class="edit-btn" data-edit="${s.step}">Editar</button></div>
          ${s.rows.map(r => `<div class="review-row"><span class="k">${esc(r.k)}</span><span class="v">${esc(r.v)}</span></div>`).join('')}
        </div>`).join('') +
      `<div class="note">Ao tocar em enviar, o WhatsApp abre com essas informações prontas. O orçamento chega por lá.</div>`,
  ];

  function missing(step) {
    const { svc, f } = S, m = [];
    if (step === 0) { if (!svc.banho && !svc.creche && !svc.hotel) m.push('escolha um serviço'); if (svc.banho && !f.banhoOpts.length) m.push('serviço de banho e tosa'); if (svc.banho && f.banhoOpts.includes('Outros') && !f.banhoOutros) m.push('qual outro serviço'); if (svc.creche && !f.crecheOpt) m.push('vezes por semana da creche');
      if (svc.creche) { const n = vezes(), d = f.diasSemana.length; if (!d) m.push('dias da semana da creche'); else if (n && d !== n) m.push(`escolha ${n} dia${n > 1 ? 's' : ''} da semana (marcou ${d})`); } }
    if (step === 1) { if (!f.tutor) m.push('nome do tutor'); if ((f.telefone || '').replace(/\D/g, '').length < 10) m.push('WhatsApp');
      if (svc.hotel) { if (!f.emergNome) m.push('nome do contato de emergência'); if ((f.emergTel || '').replace(/\D/g, '').length < 10) m.push('telefone de emergência'); } }
    if (step === 2) { if (!f.pet) m.push('nome do pet'); if (!f.raca) m.push('raça'); if (!f.porte) m.push('porte'); if (!f.vermifugado) m.push('vermifugação'); if (!f.vacinas.length) m.push('vacinas'); if ((svc.hotel || svc.creche) && !f.avaliacao) m.push('avaliação');
      if (!f.idade) m.push('idade');
      if (!f.especial) m.push('problema de saúde/necessidade especial');
      if (svc.creche) { if (!f.antipulgas) m.push('pulgas e carrapatos'); if (!f.jaCreche) m.push('se já frequentou creche'); }
      if (f.especial === 'Sim' && !f.especialDesc) m.push('descrição da necessidade especial');
      if (f.medicacao === 'Sim' && !f.medicacaoDesc) m.push('qual medicação');
      if (svc.banho && !f.comportBanho.length) m.push('comportamento no banho');
      if (svc.hotel) { if (!f.antipulgas) m.push('pulgas e carrapatos'); if (!f.medicacao) m.push('medicação'); if (!f.alimentacao) m.push('alimentação'); if (!f.refeicoes) m.push('refeições por dia'); }
      if (svc.hotel || svc.creche) { if (!f.comportCaes) m.push('se é sociável com cães'); if (!f.comportPessoas) m.push('comportamento com pessoas'); } }
    if (step === 3) { if (svc.banho && !f.data) m.push('melhor dia do banho'); if (svc.banho && !f.horario) m.push('melhor horário do banho');
      if (svc.creche) { if (!f.crecheInicio) m.push('início da creche'); if (!f.crecheEntrada) m.push('entrada na creche'); if (!f.crecheSaida) m.push('saída da creche'); } if (svc.hotel && !f.entrada) m.push('entrada'); if (svc.hotel && !f.saida) m.push('saída'); if (svc.hotel && !f.horaEntrada) m.push('horário de entrada'); if (svc.hotel && !f.horaSaida) m.push('horário de retirada'); if (svc.hotel && f.entrada && f.saida && nights() < 1) m.push('saída depois da entrada'); if (f.levaTraz === 'Sim' && !f.endereco) m.push('endereço para busca'); }
    return m;
  }

  function sections() {
    const { svc, f } = S, n = nights(), care = svc.hotel || svc.creche;
    const vac = f.vacinas.includes(VAC_NONE) ? 'Nenhuma / não sei' : f.vacinas.length
      ? f.vacinas.join(', ') + (VAC_REQ.filter(v => !f.vacinas.includes(v)).length ? ` (faltando: ${VAC_REQ.filter(v => !f.vacinas.includes(v)).join(', ')})` : ' (todas as obrigatórias)') : '';
    const r = (k, v) => v && (Array.isArray(v) ? v.length : true) ? { k, v: Array.isArray(v) ? v.join(', ') : v } : null;
    const servs = [];
    if (svc.banho) servs.push(r('Banho e tosa', f.banhoOpts.map(o => o === 'Outros' && f.banhoOutros ? `Outros (${f.banhoOutros})` : o)));
    if (svc.creche) servs.push(r('Creche', f.crecheOpt && `${f.crecheOpt}${f.diasSemana.length ? ` (${OPTS.diasSemana.filter(d => f.diasSemana.includes(d)).join(', ')})` : ''}`));
    if (svc.hotel) servs.push(r('Hotel', f.entrada && f.saida ? `${fmt(f.entrada)}${f.horaEntrada ? ' às ' + f.horaEntrada : ''} a ${fmt(f.saida)}${f.horaSaida ? ' às ' + f.horaSaida : ''}${n > 0 ? ` (${n} diária${n > 1 ? 's' : ''})` : ''}` : 'Datas a definir'));
    return [
      { title: 'Serviços', step: 0, rows: servs },
      { title: 'Tutor', step: 1, rows: [r('Nome', f.tutor), r('WhatsApp', f.telefone), r('Emergência', [f.emergNome, f.emergTel].filter(Boolean).join(' · '))] },
      { title: 'Pet', step: 2, rows: [r('Nome', f.pet), r('Espécie', f.especie), r('Raça', f.raca), r('Idade', f.idade), r('Sexo', f.sexo), r('Castrado', f.castrado), r('Porte', f.porte), r('Vermifugado', f.vermifugado), r('Vacinas obrigatórias em dia', vac), r('Pulgas e carrapatos', f.antipulgas), r('Medicação', f.medicacao === 'Sim' ? `Sim: ${f.medicacaoDesc || ''}` : f.medicacao), r('Problema de saúde/necessidade especial', f.especial === 'Sim' ? `Sim: ${f.especialDesc || ''}` : f.especial), r('Comportamento no banho', svc.banho && f.comportBanho), r('Temperamento', f.temperamento), r('Alimentação', care && f.alimentacao), r('Refeições por dia', svc.hotel && f.refeicoes), r('Com outros cães', care && f.comportCaes), r('Com pessoas', care && f.comportPessoas), r('Já frequentou creche', svc.creche && f.jaCreche), r('Pertences', svc.hotel && f.pertences), r('Já fez avaliação', care && f.avaliacao)] },
      { title: 'Quando', step: 3, rows: [r('Melhor dia (banho)', svc.banho && fmt(f.data)), r('Melhor horário (banho)', svc.banho && f.horario), r('Início da creche', svc.creche && fmt(f.crecheInicio)), r('Horário da creche', svc.creche && f.crecheEntrada && `${f.crecheEntrada} às ${f.crecheSaida || '?'}`), r('Leva e traz', f.levaTraz), r('Endereço', f.levaTraz === 'Sim' && f.endereco), r('Observações', f.obs)] },
    ].map(s => ({ ...s, rows: s.rows.filter(Boolean) }));
  }

  function waLink() {
    const L = ['Olá, Spa PetFeliz! Gostaria de solicitar um orçamento.'];
    sections().forEach(s => { if (!s.rows.length) return; L.push('', `*${s.title.toUpperCase()}*`); s.rows.forEach(x => L.push(`• ${x.k}: ${x.v}`)); });
    L.push('', 'Enviado pelo site Spa PetFeliz');
    return WA_DIRECT + '?text=' + encodeURIComponent(L.join('\n'));
  }

  function setErr(msg) { const e = $('#err'); e.textContent = msg || ''; e.hidden = !msg; }

  function renderFlow(keepScroll) {
    const { step, sent } = S;
    app.classList.toggle('is-sent', sent);
    $('#stepLabel').textContent = `Etapa ${step + 1} de 5 · ${LABELS[step]}`;
    $('#steps').innerHTML = LABELS.map((l, i) => `<div class="step${i <= step ? ' done' : ''}${i === step ? ' cur' : ''}"><div class="bar"></div><span>${l}</span></div>`).join('');
    form.hidden = sent; $('#sent').hidden = !sent;
    if (sent) {
      $('#petName').textContent = S.f.pet || 'seu pet';
      $('#waAgain').href = waLink();
    } else {
      const top = scroll.scrollTop;
      form.innerHTML = STEPS[step]();
      if (keepScroll) scroll.scrollTop = top;
    }
    $('#backBtn').hidden = step === 0;
    $('#nextBtn').hidden = step === 4;
    $('#sendBtn').hidden = step !== 4;
    if (step === 4) $('#sendBtn').href = waLink();
  }

  function setStep(n) { S.step = n; setErr(''); scroll.scrollTop = 0; renderFlow(); }

  form.addEventListener('click', e => {
    const c = e.target.closest('[data-chip]');
    if (c) {
      const k = c.dataset.chip, v = c.dataset.val;
      if (MULTI[k]) {
        let a = S.f[k] || [];
        if (k === 'vacinas' && !a.includes(v)) a = v === VAC_NONE ? [] : a.filter(x => x !== VAC_NONE);
        S.f[k] = a.includes(v) ? a.filter(x => x !== v) : [...a, v];
      }
      else S.f[k] = S.f[k] === v ? undefined : v;
      setErr(''); renderFlow(true);
      if (k === 'levaTraz' && S.f.levaTraz === 'Sim') { const i = $('[data-f="endereco"]', form); if (i) i.focus(); }
      return;
    }
    const p = e.target.closest('[data-svc]');
    if (p) { const k = p.dataset.svc; S.svc[k] = !S.svc[k]; setErr(''); renderFlow(true); return; }
    const ed = e.target.closest('[data-edit]');
    if (ed) setStep(+ed.dataset.edit);
  });

  form.addEventListener('input', e => {
    const el = e.target, k = el.dataset.f; if (!k) return;
    if (PHONE_FIELDS[k]) { el.value = phoneMask(el.value); }
    S.f[k] = el.value;
    setErr('');
    if (k === 'entrada' || k === 'saida') { const n = $('#nights'); if (n) n.textContent = nightsLabel(); }
  });

  $('#nextBtn').addEventListener('click', () => {
    const m = missing(S.step);
    if (m.length) setErr('Falta preencher: ' + m.join(', ') + '.');
    else setStep(S.step + 1);
  });
  $('#backBtn').addEventListener('click', () => setStep(Math.max(0, S.step - 1)));
  $('#sendBtn').addEventListener('click', () => { S.sent = true; scroll.scrollTop = 0; renderFlow(); });
  $('#resetAll').addEventListener('click', () => { S = fresh(); setErr(''); go('inicio'); });

  go(location.hash === '#servicos' ? 'servicos' : 'inicio');
})();
