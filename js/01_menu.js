
function abrirMenuMais(){
  const e=document.getElementById('menu-mais-bau-emoji'),a=document.getElementById('atalho-bau-emoji');
  if(e&&a)e.textContent=a.textContent||'🎁';
  abrirModal('modal-menu-mais');
}
