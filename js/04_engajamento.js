
/* RotinaPet 49–59: camada de engajamento opcional e compatível. */
const DESAFIOS_DIARIOS=[
 ['Organizar 5 brinquedos','Ajude a deixar seu espaço mais bonito.'],['Ler por 10 minutos','Escolha uma história e viaje na imaginação.'],['Beber água','Cuide do seu corpo com um copo de água.'],['Ajudar a colocar a mesa','Uma pequena ajuda faz diferença.'],['Fazer um desenho','Crie algo especial para o seu pet.'],['Organizar a mochila','Deixe tudo pronto para amanhã.'],['Ajudar sem ninguém pedir','Uma atitude gentil vale muito!'],['Cuidar do pet','Alimente, brinque ou dê carinho ao seu companheiro.'],['Separar as roupas','Ajude a deixar as roupas organizadas.'],['Guardar os sapatos','Cada coisa no seu lugar!']
];
const EVENTOS_SEMANAIS=[
 ['Semana do Pequeno Ajudante','Complete 5 missões de ajuda em casa.','🏆 Medalha do Ajudante'],['Semana do Pet Saudável','Cuide do pet em 5 momentos diferentes.','💚 Medalha do Cuidado'],['Semana da Gentileza','Faça 3 atitudes gentis.','💜 Medalha da Gentileza'],['Semana da Criatividade','Complete 3 missões criativas.','🎨 Medalha da Criatividade']
];
function garantirEngajamento(){
  if(!Array.isArray(estado.adesivos))estado.adesivos=[];
  if(!Array.isArray(estado.mensagensPais))estado.mensagensPais=[];
  if(!Array.isArray(estado.historicoEngajamento))estado.historicoEngajamento=[];
  if(!Number.isFinite(Number(estado.escudosOfensiva)))estado.escudosOfensiva=0;
  if(!estado.missaoFamilia||typeof estado.missaoFamilia!=='object')estado.missaoFamilia={alvo:20,progresso:0,inicio:hojeLocal()};
  const hoje=hojeLocal();
  if(estado.desafioDiarioData!==hoje){
    const base=new Date(hoje+'T12:00:00'),indice=(base.getFullYear()*31+base.getMonth()*17+base.getDate())%DESAFIOS_DIARIOS.length;
    estado.desafioDiarioData=hoje;estado.desafioDiarioFeitoData=null;
    estado.desafioDiario=DESAFIOS_DIARIOS[indice];
  }
  if(!Array.isArray(estado.desafioDiario))estado.desafioDiario=DESAFIOS_DIARIOS[0];
  const semana=Math.floor(Date.now()/604800000);
  if(estado.eventoSemanalData!==semana){estado.eventoSemanalData=semana;estado.eventoSemanal=EVENTOS_SEMANAIS[semana%EVENTOS_SEMANAIS.length];}
  if(!Array.isArray(estado.eventoSemanal))estado.eventoSemanal=EVENTOS_SEMANAIS[0];
}
function registrarEngajamento(texto){
  garantirEngajamento();estado.historicoEngajamento.push({texto,data:hojeLocal(),hora:Date.now()});estado.historicoEngajamento=estado.historicoEngajamento.slice(-60);salvar();
}
function renderizarEngajamento(){
  garantirEngajamento();
  const hoje=hojeLocal(),feito=estado.desafioDiarioFeitoData===hoje;
  const d=document.getElementById('engajamento-desafio'),st=document.getElementById('engajamento-streak'),b=document.getElementById('btn-bau-diario');
  if(d)d.innerHTML=feito?`✅ Desafio concluído: <b>${esc(estado.desafioDiario[0])}</b>`:`🌟 <b>Desafio especial:</b> ${esc(estado.desafioDiario[0])}<br><small>${esc(estado.desafioDiario[1])} · +10 🪙 e +20 XP</small>`;
  if(st)st.textContent=`🔥 ${Number(estado.streak)||0} dias`;
  const pode=Number(estado.tarefasHojeCount||0)>0||feito,aberto=estado.bauDiarioAbertoData===hoje;
  if(b){b.disabled=!pode||aberto;b.textContent=aberto?'✅ Baú aberto':pode?'🎁 Baú do dia':'🔒 Faça uma missão';}
  const msg=estado.mensagensPais?.[estado.mensagensPais.length-1];
  if(msg&&msg.lida!==true&&document.getElementById('balao-fala')){mostrarBalaoFala('💌 '+msg.texto,3600);msg.lida=true;salvar();}
}
function concluirDesafioDiario(){
  garantirEngajamento();if(estado.desafioDiarioFeitoData===hojeLocal())return;
  estado.desafioDiarioFeitoData=hojeLocal();estado.moedas=(Number(estado.moedas)||0)+10;estado.dinheiroAcumulado=(Number(estado.dinheiroAcumulado)||0)+(10*(Number(estado.taxaCambio)||.01));ganharXP(20);estado.adesivos.push('desafio_'+hojeLocal());registrarEngajamento('Desafio diário concluído');dispararConfetes();mostrarAviso('🌟','Desafio concluído!','+10 moedas, +20 XP e um adesivo foram adicionados.');atualizarTela();
}
let bauDataEmAbertura=null;
function bauJaResgatado(data){return estado.bauDiarioAbertoData===data||(estado.bauDatasResgatadas||[]).includes(data)}
function abrirBauDiario(dataSolicitada){
  garantirEngajamento();
  const hoje=hojeLocal(),data=typeof dataSolicitada==='string'?dataSolicitada:hoje;
  const pendente=(estado.avisosRecompensas||[]).some(a=>a.tipo==='bau'&&a.data===data);
  if(bauJaResgatado(data))return mostrarToast('✅ Este baú já foi aberto.');
  if(!pendente&&(data!==hoje||Number(estado.tarefasHojeCount||0)<=0&&estado.desafioDiarioFeitoData!==hoje))return mostrarToast('🔒 Complete uma missão ou o desafio diário primeiro.');
  bauDataEmAbertura=data;
  const c=document.getElementById('bau-diario-conteudo');
  if(c)c.innerHTML='<div style="font-size:48px;margin:8px">🎁</div><p style="font-size:10px;color:#64748b">Uma surpresa pela missão concluída!</p><button class="primary-btn pink-btn" style="width:100%;margin-top:8px" onclick="abrirPremioBauDiario()">✨ Abrir agora</button>';
  abrirModal('modal-bau-diario');
}
function abrirPremioBauDiario(){
  const data=bauDataEmAbertura||hojeLocal(),hoje=hojeLocal();
  if(bauJaResgatado(data))return;
  const pendente=(estado.avisosRecompensas||[]).some(a=>a.tipo==='bau'&&a.data===data);
  if(!pendente&&(data!==hoje||Number(estado.tarefasHojeCount||0)<=0&&estado.desafioDiarioFeitoData!==hoje))return;
  estado.bauDatasResgatadas=Array.isArray(estado.bauDatasResgatadas)?estado.bauDatasResgatadas:[];
  estado.bauDatasResgatadas.push(data);
  estado.bauDatasResgatadas=estado.bauDatasResgatadas.slice(-90);
  if(data===hoje)estado.bauDiarioAbertoData=hoje;
  const n=Math.random();let texto,valor;
  if(n<.55){valor=8+Math.floor(Math.random()*8);estado.moedas+=valor;estado.dinheiroAcumulado=(estado.dinheiroAcumulado||0)+valor*(Number(estado.taxaCambio)||.01);texto=`+${valor} moedas`;}
  else if(n<.9){valor=20;ganharXP(valor);texto=`+${valor} XP`;}
  else{estado.escudosOfensiva=Math.min(2,(Number(estado.escudosOfensiva)||0)+1);texto='🛡️ Escudo da ofensiva';}
  estado.adesivos.push('bau_'+data);
  const fila=estado.avisosRecompensas||[],indice=fila.findIndex(a=>a.tipo==='bau'&&a.data===data);
  if(indice>=0){const aviso=fila.splice(indice,1)[0];estado.historicoRecompensas=Array.isArray(estado.historicoRecompensas)?estado.historicoRecompensas:[];estado.historicoRecompensas.push({...aviso,abertaEm:Date.now(),premio:texto});estado.historicoRecompensas=estado.historicoRecompensas.slice(-40)}
  bauDataEmAbertura=null;
  atualizarCaixaConquistas();registrarEngajamento('Baú diário aberto');salvar();fecharModal('modal-bau-diario');dispararConfetes();mostrarAviso('🎁','Baú aberto!',`${texto} e um adesivo de coleção!`);atualizarTela();
}
function abrirCentralAventuras(){
  garantirEngajamento();const c=document.getElementById('central-aventuras-conteudo');if(!c)return;
  const d=estado.desafioDiario,feito=estado.desafioDiarioFeitoData===hojeLocal(),ev=estado.eventoSemanal,m=estado.missaoFamilia;
  c.innerHTML=`<div class="section-card" style="margin-bottom:7px"><b style="font-size:10px">🌟 Desafio diário</b><p style="font-size:9px;color:#475569;line-height:1.35;margin:6px 0">${esc(d[0])}<br><small>${esc(d[1])}</small></p>${feito?'<span style="font-size:8px;color:#15803d;font-weight:900">✅ Concluído hoje</span>':'<button class="primary-btn pink-btn" style="width:100%" onclick="concluirDesafioDiario();abrirCentralAventuras()">Concluí o desafio</button>'}</div><div class="section-card" style="margin-bottom:7px"><b style="font-size:10px">🏆 Evento da semana</b><p style="font-size:9px;color:#475569;margin:6px 0">${esc(ev[0])}<br><small>${esc(ev[1])}</small></p><b style="font-size:8px;color:#7c3aed">Prêmio: ${esc(ev[2])}</b></div><div class="section-card" style="margin-bottom:7px"><b style="font-size:10px">👨‍👩‍👧 Missão da família</b><p style="font-size:9px;color:#475569;margin:6px 0">Todos juntos: ${Number(m.progresso)||0}/${Number(m.alvo)||20} missões nesta semana.</p><div style="height:6px;background:#e2e8f0;border-radius:99px;overflow:hidden"><div style="height:100%;width:${Math.min(100,Math.round(((Number(m.progresso)||0)/(Number(m.alvo)||20))*100))}%;background:#22c55e"></div></div></div><div class="section-card"><b style="font-size:10px">📒 Minha coleção de adesivos</b><p style="font-size:9px;color:#475569;margin:6px 0">${new Set(estado.adesivos||[]).size} adesivo(s) encontrados. Complete desafios e abra baús para encontrar mais.</p><b style="font-size:8px;color:#7c3aed">🛡️ Escudos disponíveis: ${Number(estado.escudosOfensiva)||0}</b></div>`;
  abrirModal('modal-central-aventuras');
}
function enviarElogioCrianca(texto){
  garantirEngajamento();estado.mensagensPais.push({texto,data:hojeLocal(),hora:Date.now(),lida:false});estado.mensagensPais=estado.mensagensPais.slice(-20);registrarEngajamento('Mensagem dos pais enviada');salvar();mostrarToast('💌 Mensagem enviada!');
}
function atualizarMissaoFamilia(){garantirEngajamento();estado.missaoFamilia.progresso=(Number(estado.missaoFamilia.progresso)||0)+1;salvar();}
const atualizarTelaOriginal=atualizarTela;
atualizarTela=function(){atualizarTelaOriginal();renderizarEngajamento();atualizarCaixaConquistas();};
setTimeout(()=>{try{garantirEngajamento();renderizarEngajamento();}catch(e){console.warn('Engajamento:',e)}},300);
