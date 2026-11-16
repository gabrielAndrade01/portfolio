// Lista de projetos com filtro por categoria.
// Depende de projetos.js (CATEGORIAS e projetos), carregado antes deste arquivo.
(function () {
  "use strict";


  /* ============ 1. SELEÇÃO DOS ELEMENTOS ============ */

  const elementos = {
    grupoFiltros: document.querySelector("#filtros"),
    listaProjetos: document.querySelector("#lista-projetos"),
    mensagemStatus: document.querySelector("#status"),
    avisoSemResultados: document.querySelector("#sem-resultados"),
    textoSemResultados: document.querySelector("#msg-sem-resultados"),
    botaoMostrarTodos: document.querySelector("#btn-ver-todos")
  };


  /* ============ 2. CONSTANTES E ESTADO ============ */

  const FILTRO_TODOS = "todos";

  let filtroAtual = FILTRO_TODOS; // estado do filtro (separado dos dados)

  function nomeDoFiltro(chave) {
    return chave === FILTRO_TODOS ? "Todos" : CATEGORIAS[chave];
  }

  function pluralizarProjetos(quantidade) {
    return quantidade === 1 ? "projeto" : "projetos";
  }


  /* ============ 3. FILTRO (só decide quais itens passam; não mexe no DOM) ============ */

  function filtrarPorCategoria(itens, filtro) {
    return filtro === FILTRO_TODOS ? itens : itens.filter((projeto) => projeto.categoria === filtro);
  }


  /* ============ 4. CRIAÇÃO DOS ELEMENTOS (todo texto entra por textContent) ============ */

  function criarLinhaRotulada(rotulo, valor) {
    const linha = document.createElement("p");
    linha.className = "tecnologias";

    const rotuloEmDestaque = document.createElement("strong");
    rotuloEmDestaque.textContent = `${rotulo}:`;

    linha.append(rotuloEmDestaque, ` ${valor}`);
    return linha;
  }

  function criarCartaoDoProjeto(projeto) {
    const cartao = document.createElement("article");
    cartao.className = "card";

    const titulo = document.createElement("h3");
    titulo.textContent = projeto.titulo;
    cartao.append(titulo);

    if (projeto.descricao) {
      const descricao = document.createElement("p");
      descricao.textContent = projeto.descricao;
      cartao.append(descricao);
    }

    cartao.append(criarLinhaRotulada("Categoria", CATEGORIAS[projeto.categoria]));

    if (projeto.tecnologias.length > 0) {
      cartao.append(criarLinhaRotulada("Tecnologias", projeto.tecnologias.join(", ")));
    }

    if (projeto.link) {
      const link = document.createElement("a");
      link.className = "botao";
      link.href = projeto.link.url;
      link.textContent = projeto.link.texto;
      link.setAttribute("aria-label", `${projeto.link.texto}: ${projeto.titulo}`);
      cartao.append(link);
    }

    return cartao;
  }

  function criarBotaoDeFiltro(chave) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-filtro";
    botao.dataset.filtro = chave;
    botao.textContent = nomeDoFiltro(chave);
    return botao;
  }

  // Os botões do filtro nascem de CATEGORIAS: uma categoria nova aparece sozinha
  function preencherFiltros() {
    const chaves = [FILTRO_TODOS, ...Object.keys(CATEGORIAS)];
    elementos.grupoFiltros.append(...chaves.map(criarBotaoDeFiltro));
  }


  /* ============ 5. RENDERIZAÇÃO ============ */

  function atualizarEstadoDosFiltros() {
    elementos.grupoFiltros.querySelectorAll("[data-filtro]").forEach((botao) => {
      botao.setAttribute("aria-pressed", String(botao.dataset.filtro === filtroAtual));
    });
  }

  function atualizarAvisoSemResultados(quantidadeVisivel) {
    const semResultados = quantidadeVisivel === 0;
    elementos.avisoSemResultados.hidden = !semResultados;
    if (!semResultados) return;

    const semNenhumProjeto = projetos.length === 0;
    elementos.botaoMostrarTodos.hidden = semNenhumProjeto;
    elementos.textoSemResultados.textContent = semNenhumProjeto
      ? "Ainda não há projetos publicados por aqui. Volte em breve."
      : `Nenhum projeto na categoria ${nomeDoFiltro(filtroAtual)} por enquanto. Escolha outra categoria ou mostre todos os projetos.`;
  }

  function montarContagem(quantidadeVisivel) {
    const total = projetos.length;
    if (filtroAtual === FILTRO_TODOS) {
      return `Mostrando ${total} ${pluralizarProjetos(total)}.`;
    }
    const sufixo = quantidadeVisivel === 1 ? "" : "s";
    return `${quantidadeVisivel} ${pluralizarProjetos(quantidadeVisivel)} encontrado${sufixo} em ${nomeDoFiltro(filtroAtual)} (de ${total} no total).`;
  }

  function renderizarProjetos() {
    const visiveis = filtrarPorCategoria(projetos, filtroAtual);

    elementos.listaProjetos.replaceChildren(...visiveis.map(criarCartaoDoProjeto));
    atualizarEstadoDosFiltros();
    atualizarAvisoSemResultados(visiveis.length);
    elementos.mensagemStatus.textContent = montarContagem(visiveis.length);
  }

  function focarFiltroAtual() {
    elementos.grupoFiltros.querySelector(`[data-filtro="${filtroAtual}"]`).focus();
  }


  /* ============ 6. REAÇÕES AOS EVENTOS ============ */

  function aoEscolherFiltro(evento) {
    const botao = evento.target.closest("[data-filtro]");
    if (!botao) return;

    filtroAtual = botao.dataset.filtro;
    renderizarProjetos();
  }

  function aoPedirTodosOsProjetos() {
    filtroAtual = FILTRO_TODOS;
    renderizarProjetos();
    focarFiltroAtual(); // o aviso some, então o foco vai para o filtro
  }


  /* ============ 7. INÍCIO (cada listener é registrado uma única vez) ============ */

  function iniciar() {
    preencherFiltros();

    elementos.grupoFiltros.addEventListener("click", aoEscolherFiltro);
    elementos.botaoMostrarTodos.addEventListener("click", aoPedirTodosOsProjetos);

    renderizarProjetos();
  }

  iniciar();
})();