// Interface geral do site: tema claro/escuro, "Mostrar mais", foto ampliada e botão "Voltar ao topo".
// Fica dentro de uma função para os nomes não se misturarem com os de outros arquivos.
(function () {
  "use strict";


  /* ============ 1. SELEÇÃO DOS ELEMENTOS ============ */

  const elementos = {
    corpo: document.body,
    botaoTema: document.querySelector("#tema"),
    botaoMostrarMais: document.querySelector("#btn-mostrar-mais"),
    textoExtra: document.querySelector("#sobre-extra"),
    botaoFotoPerfil: document.querySelector("#abrir-foto"),
    imagemDoPerfil: document.querySelector(".foto-perfil"),
    dialogoFoto: document.querySelector("#dialogo-foto"),
    areaFotoAmpliada: document.querySelector("#area-foto-ampliada"),
    botaoFecharFoto: document.querySelector("#fechar-foto"),
    topo: document.querySelector("#topo"),
    botaoVoltarAoTopo: document.querySelector("#voltar-ao-topo")
  };

  // Depois de rolar esta distância (em pixels), o botão "Voltar ao topo" aparece
  const DISTANCIA_PARA_MOSTRAR_BOTAO_PX = 600;

  let atualizacaoAgendada = false;


  /* ============ 2. TEMA CLARO / ESCURO ============ */

  function aoAlternarTema() {
    const escuro = elementos.corpo.classList.toggle("escuro");
    elementos.botaoTema.setAttribute("aria-pressed", String(escuro));
  }


  /* ============ 3. MOSTRAR MAIS / MOSTRAR MENOS ============ */

  function aoAlternarMostrarMais() {
    const vaiAbrir = elementos.textoExtra.hidden;
    elementos.textoExtra.hidden = !vaiAbrir;
    elementos.botaoMostrarMais.setAttribute("aria-expanded", String(vaiAbrir));
    elementos.botaoMostrarMais.textContent = vaiAbrir ? "Mostrar menos" : "Mostrar mais";
  }


  /* ============ 4. FOTO AMPLIADA ============ */

  // A imagem ampliada é uma cópia da foto do cabeçalho: o arquivo só precisa ser trocado no HTML, em um lugar.
  function criarImagemAmpliada() {
    const imagem = elementos.imagemDoPerfil.cloneNode(false);
    imagem.removeAttribute("width");
    imagem.removeAttribute("height");
    imagem.className = "foto-ampliada";
    return imagem;
  }

  // showModal() já trata Esc para fechar, prende o foco na janela e devolve o foco ao botão ao fechar
  function aoAbrirFoto() {
    elementos.areaFotoAmpliada.replaceChildren(criarImagemAmpliada());
    elementos.dialogoFoto.showModal();
  }

  function aoFecharFoto() {
    elementos.dialogoFoto.close();
  }

  // Clicar fora da foto também fecha
  function aoClicarNoDialogo(evento) {
    if (evento.target === elementos.dialogoFoto) aoFecharFoto();
  }


  /* ============ 5. VOLTAR AO TOPO ============ */

  function atualizarBotaoVoltarAoTopo() {
    const visivel = window.scrollY > DISTANCIA_PARA_MOSTRAR_BOTAO_PX;
    elementos.botaoVoltarAoTopo.dataset.visivel = String(visivel);
  }

  // Rolar dispara o evento dezenas de vezes por segundo: atualiza no máximo uma vez por quadro
  function aoRolar() {
    if (atualizacaoAgendada) return;
    atualizacaoAgendada = true;
    requestAnimationFrame(() => {
      atualizacaoAgendada = false;
      atualizarBotaoVoltarAoTopo();
    });
  }

  // A rolagem é suave (ou direta, para quem reduz animações) por causa do CSS da página.
  // O foco vai para o topo: o botão some ao chegar lá e o foco não pode ficar perdido nele.
  function aoVoltarAoTopo() {
    window.scrollTo({ top: 0 });
    elementos.topo.focus({ preventScroll: true });
  }


  /* ============ 6. INÍCIO (cada listener é registrado uma única vez) ============ */

  function iniciar() {
    elementos.botaoTema.addEventListener("click", aoAlternarTema);
    elementos.botaoMostrarMais.addEventListener("click", aoAlternarMostrarMais);
    elementos.botaoFotoPerfil.addEventListener("click", aoAbrirFoto);
    elementos.botaoFecharFoto.addEventListener("click", aoFecharFoto);
    elementos.dialogoFoto.addEventListener("click", aoClicarNoDialogo);
    window.addEventListener("scroll", aoRolar, { passive: true });
    elementos.botaoVoltarAoTopo.addEventListener("click", aoVoltarAoTopo);

    atualizarBotaoVoltarAoTopo();
  }

  iniciar();
})();