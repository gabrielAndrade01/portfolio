// Formulário de contato: valida os campos, mostra os estados (edição, erro, processando,
// sucesso e falha) e envia a mensagem para o Formspree, que a encaminha por e-mail.
// Fica dentro de uma função para os nomes não se misturarem com os de outros arquivos.
(function () {
  "use strict";


  /* ============ 1. SELEÇÃO DOS ELEMENTOS ============ */

  const formulario = document.querySelector("#formulario-contato");
  const grupoDeCampos = document.querySelector("#campos-contato");
  const botaoEnviar = document.querySelector("#botao-enviar-contato");
  const statusDoFormulario = document.querySelector("#status-contato");
  const resumoDeErros = document.querySelector("#resumo-erros");
  const tituloDoResumo = document.querySelector("#titulo-resumo-erros");
  const listaDoResumo = document.querySelector("#lista-resumo-erros");
  const blocoDoAssunto = document.querySelector("#bloco-assunto");
  const contadorDaMensagem = document.querySelector("#contador-mensagem");

  function selecionarCampo(chave, rotulo) {
    return {
      controle: document.querySelector(`#campo-${chave}`),
      erro: document.querySelector(`#erro-${chave}`),
      rotulo
    };
  }

  // A ordem aqui é a ordem da tela: define qual é o "primeiro campo inválido".
  const campos = {
    nome: selecionarCampo("nome", "Nome"),
    email: selecionarCampo("email", "E-mail"),
    motivo: selecionarCampo("motivo", "Motivo"),
    assunto: selecionarCampo("assunto", "Assunto adicional"),
    mensagem: selecionarCampo("mensagem", "Mensagem")
  };
  const CHAVES_DOS_CAMPOS = Object.keys(campos);


  /* ============ 2. REGRAS, CONSTANTES E ESTADO ============ */

  const REGRAS_DE_TEXTO = {
    nome: { minimo: 3, maximo: 80, sujeito: "O nome", pedido: "Informe seu nome." },
    assunto: { minimo: 5, maximo: 100, sujeito: "O assunto", pedido: "Informe o assunto da mensagem." },
    mensagem: { minimo: 30, maximo: 1000, sujeito: "A mensagem", pedido: "Escreva sua mensagem." }
  };

  const NOMES_DOS_MOTIVOS = {
    oportunidade: "Oportunidade profissional",
    freelance: "Projeto freelance",
    outro: "Outro"
  };
  const MOTIVO_OUTRO = "outro";
  const MOTIVOS_VALIDOS = Object.keys(NOMES_DOS_MOTIVOS);

  // Endereço do formulário no Formspree.:
  // o e-mail que recebe as mensagens fica configurado no painel do Formspree.
  const ENDERECO_DO_SERVICO_DE_ENVIO = "https://formspree.io/f/myewydzk";
  const TEMPO_LIMITE_DO_ENVIO_MS = 15000;

  const TEXTO_DO_BOTAO = "Enviar mensagem";

  const ESTADOS = {
    EDICAO: "edicao",
    ERRO: "erro",
    PROCESSANDO: "processando",
    SUCESSO: "sucesso",
    FALHA: "falha"
  };

  const ROTULOS_DOS_ESTADOS = {
    [ESTADOS.EDICAO]: "",
    [ESTADOS.ERRO]: "Erro de validação",
    [ESTADOS.PROCESSANDO]: "Processando",
    [ESTADOS.SUCESSO]: "Sucesso",
    [ESTADOS.FALHA]: "Falha"
  };

  let estadoAtual = ESTADOS.EDICAO;
  let tentouEnviar = false;
  const camposJaUsados = new Set();

  function chaveDoControle(elemento) {
    return CHAVES_DOS_CAMPOS.find((chave) => campos[chave].controle === elemento);
  }


  /* ============ 3. LEITURA, NORMALIZAÇÃO E CONTAGEM ============ */

  // trim() só nas pontas: o conteúdo interno não é alterado.
  function normalizarTexto(texto) {
    return String(texto ?? "").trim();
  }

  // CRITÉRIO ÚNICO de contagem, usado no contador e na validação:
  // caracteres do texto sem espaços nas pontas, em unidades UTF-16 (String.length),
  // a mesma unidade do atributo maxlength do navegador.
  function contarCaracteres(texto) {
    return normalizarTexto(texto).length;
  }

  // Campos desabilitados (assunto fora de "Outro") não entram no FormData.
  function lerValores() {
    const dados = new FormData(formulario);
    return {
      nome: normalizarTexto(dados.get("nome")),
      email: normalizarTexto(dados.get("email")),
      motivo: normalizarTexto(dados.get("motivo")),
      assunto: normalizarTexto(dados.get("assunto")),
      mensagem: normalizarTexto(dados.get("mensagem"))
    };
  }

  function assuntoSeAplica(motivo) {
    return motivo === MOTIVO_OUTRO;
  }

  // Dados que realmente seguem para o processamento.
  function montarDadosParaEnvio(valores) {
    const dados = { nome: valores.nome, email: valores.email, motivo: valores.motivo };
    if (assuntoSeAplica(valores.motivo)) {
      dados.assunto = valores.assunto;
    }
    dados.mensagem = valores.mensagem;
    return dados;
  }


  /* ============ 4. VALIDAÇÃO ============ */

  function validarTexto(texto, regra) {
    const quantidade = contarCaracteres(texto);
    if (quantidade === 0) {
      return regra.pedido;
    }
    if (quantidade < regra.minimo) {
      return `${regra.sujeito} precisa ter pelo menos ${regra.minimo} caracteres (agora tem ${quantidade}).`;
    }
    if (quantidade > regra.maximo) {
      return `${regra.sujeito} pode ter no máximo ${regra.maximo} caracteres (agora tem ${quantidade}).`;
    }
    return "";
  }

  // O formato vem do próprio navegador (type="email" → validity.typeMismatch).
  // Formato válido não prova que a conta existe.
  function validarEmail(email, formatoValido) {
    if (email === "") {
      return "Informe seu e-mail.";
    }
    if (!formatoValido) {
      return "Informe um e-mail em formato válido, como nome@exemplo.com.";
    }
    return "";
  }

  function validarMotivo(motivo) {
    return MOTIVOS_VALIDOS.includes(motivo) ? "" : "Escolha um motivo para o contato.";
  }

  function validarCampo(chave, valores = lerValores()) {
    switch (chave) {
      case "nome":
        return validarTexto(valores.nome, REGRAS_DE_TEXTO.nome);
      case "email":
        return validarEmail(valores.email, !campos.email.controle.validity.typeMismatch);
      case "motivo":
        return validarMotivo(valores.motivo);
      case "assunto":
        return assuntoSeAplica(valores.motivo) ? validarTexto(valores.assunto, REGRAS_DE_TEXTO.assunto) : "";
      case "mensagem":
        return validarTexto(valores.mensagem, REGRAS_DE_TEXTO.mensagem);
      default:
        return "";
    }
  }

  function validarTodosOsCampos(valores = lerValores()) {
    return CHAVES_DOS_CAMPOS
      .map((chave) => ({ chave, mensagem: validarCampo(chave, valores) }))
      .filter((resultado) => resultado.mensagem !== "");
  }


  /* ============ 5. APRESENTAÇÃO DE ERROS ============ */

  function mostrarErroDoCampo(chave, mensagem) {
    const { controle, erro } = campos[chave];
    erro.textContent = mensagem;
    erro.hidden = false;
    controle.setAttribute("aria-invalid", "true");
  }

  function limparErroDoCampo(chave) {
    const { controle, erro } = campos[chave];
    erro.textContent = "";
    erro.hidden = true;
    controle.removeAttribute("aria-invalid");
  }

  function atualizarFeedbackDoCampo(chave) {
    const mensagem = validarCampo(chave);
    if (mensagem) {
      mostrarErroDoCampo(chave, mensagem);
    } else {
      limparErroDoCampo(chave);
    }
  }

  function mostrarResultadoDaValidacao(erros) {
    const mensagensPorCampo = new Map(erros.map((erro) => [erro.chave, erro.mensagem]));
    CHAVES_DOS_CAMPOS.forEach((chave) => {
      if (mensagensPorCampo.has(chave)) {
        mostrarErroDoCampo(chave, mensagensPorCampo.get(chave));
      } else {
        limparErroDoCampo(chave);
      }
    });
    atualizarResumoDeErros();
  }

  function criarItemDoResumo({ rotulo, mensagem }) {
    const item = document.createElement("li");
    item.textContent = `${rotulo}: ${mensagem}`;
    return item;
  }

  // O resumo reflete os erros que estão visíveis junto aos campos.
  function atualizarResumoDeErros() {
    const erros = CHAVES_DOS_CAMPOS
      .filter((chave) => !campos[chave].erro.hidden)
      .map((chave) => ({ rotulo: campos[chave].rotulo, mensagem: campos[chave].erro.textContent }));

    tituloDoResumo.textContent = `Corrija ${erros.length} ${erros.length === 1 ? "campo" : "campos"} antes de enviar:`;
    listaDoResumo.replaceChildren(...erros.map(criarItemDoResumo));
    resumoDeErros.hidden = !(tentouEnviar && erros.length > 0);
  }

  function descreverCamposComProblema(quantidade) {
    return quantidade === 1 ? "1 campo precisa" : `${quantidade} campos precisam`;
  }


  /* ============ 6. REGRA CONDICIONAL E CONTADOR ============ */

  function atualizarAssuntoCondicional() {
    const aplica = assuntoSeAplica(campos.motivo.controle.value);
    blocoDoAssunto.hidden = !aplica;
    campos.assunto.controle.disabled = !aplica;
    campos.assunto.controle.required = aplica;

    if (!aplica) {
      limparErroDoCampo("assunto");
      camposJaUsados.delete("assunto");
    }
  }

  function atualizarContador() {
    const { minimo, maximo } = REGRAS_DE_TEXTO.mensagem;
    const quantidade = contarCaracteres(campos.mensagem.controle.value);

    let situacao = "ok";
    let complemento = "";
    if (quantidade > maximo) {
      situacao = "acima";
      complemento = ` Excedeu o limite em ${quantidade - maximo}.`;
    } else if (quantidade < minimo) {
      situacao = "abaixo";
      complemento = ` Faltam ${minimo - quantidade} para o mínimo de ${minimo}.`;
    }

    contadorDaMensagem.dataset.situacao = situacao;
    contadorDaMensagem.textContent = `${quantidade} de ${maximo} caracteres.${complemento}`;
  }


  /* ============ 7. ESTADOS DO FORMULÁRIO ============ */

  function definirEstado(estado, mensagem = "") {
    estadoAtual = estado;
    const processando = estado === ESTADOS.PROCESSANDO;
    const rotulo = ROTULOS_DOS_ESTADOS[estado];

    statusDoFormulario.dataset.estado = estado;
    statusDoFormulario.textContent = mensagem && rotulo ? `${rotulo}: ${mensagem}` : mensagem;

    grupoDeCampos.disabled = processando;
    formulario.setAttribute("aria-busy", String(processando));
    botaoEnviar.setAttribute("aria-disabled", String(processando));
    botaoEnviar.textContent = processando ? "Enviando..." : TEXTO_DO_BOTAO;
  }

  function confirmarCorrecaoGeral() {
    if (estadoAtual === ESTADOS.ERRO && validarTodosOsCampos().length === 0) {
      definirEstado(ESTADOS.EDICAO, "Todos os campos estão corretos. Você já pode enviar a mensagem.");
    }
  }

  function limparFormulario() {
    formulario.reset();
    camposJaUsados.clear();
    tentouEnviar = false;
    CHAVES_DOS_CAMPOS.forEach(limparErroDoCampo);
    atualizarResumoDeErros();
    atualizarAssuntoCondicional();
    atualizarContador();
  }


  /* ============ 8. ENVIO ============ */

  // No Formspree, o campo "email" vira o endereço de resposta e "_subject" o assunto do e-mail.
  function montarCorpoDaRequisicao(dados) {
    const nomeDoMotivo = NOMES_DOS_MOTIVOS[dados.motivo];
    return { ...dados, motivo: nomeDoMotivo, _subject: `Contato do portfólio: ${nomeDoMotivo}` };
  }

  // Não há senha nem chave privada aqui: o código do navegador é público e a
  // validação final também existe no servidor (o Formspree faz a dele).
  async function enviarMensagem(dados) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_DO_ENVIO_MS);

    try {
      const resposta = await fetch(ENDERECO_DO_SERVICO_DE_ENVIO, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(montarCorpoDaRequisicao(dados)),
        signal: controlador.signal
      });
      if (!resposta.ok) {
        throw new Error(`O serviço de envio respondeu com status ${resposta.status}.`);
      }
    } finally {
      clearTimeout(temporizador);
    }
  }

  function concluirComSucesso(nome) {
    limparFormulario(); // só depois da confirmação de sucesso
    definirEstado(
      ESTADOS.SUCESSO,
      `Obrigado, ${nome}! Sua mensagem foi enviada e eu vou responder para o e-mail informado.`
    );
    statusDoFormulario.focus();
  }

  function concluirComFalha() {
    definirEstado(
      ESTADOS.FALHA,
      "Não foi possível enviar a mensagem agora. Seus dados foram mantidos: tente novamente ou use o e-mail indicado abaixo do formulário."
    );
    botaoEnviar.focus();
  }

  async function processarEnvio(dados) {
    definirEstado(ESTADOS.PROCESSANDO, "aguarde, sua mensagem está sendo enviada.");

    try {
      await enviarMensagem(dados);
    } catch {
      concluirComFalha();
      return;
    }
    concluirComSucesso(dados.nome);
  }


  /* ============ 9. REAÇÕES AOS EVENTOS ============ */

  async function aoEnviar(evento) {
    evento.preventDefault();
    if (estadoAtual === ESTADOS.PROCESSANDO) return; // impede tentativas concorrentes

    tentouEnviar = true;
    const valores = lerValores();
    const erros = validarTodosOsCampos(valores);
    mostrarResultadoDaValidacao(erros);

    if (erros.length > 0) {
      definirEstado(
        ESTADOS.ERRO,
        `${descreverCamposComProblema(erros.length)} de correção. Veja o resumo e os avisos junto aos campos.`
      );
      campos[erros[0].chave].controle.focus();
      return;
    }

    await processarEnvio(montarDadosParaEnvio(valores));
  }

  function aoEditarCampo(evento) {
    const chave = chaveDoControle(evento.target);
    if (!chave) return;

    if (estadoAtual === ESTADOS.SUCESSO) definirEstado(ESTADOS.EDICAO);
    if (chave === "mensagem") atualizarContador();
    if (chave === "motivo") atualizarAssuntoCondicional();

    if (camposJaUsados.has(chave) || tentouEnviar) {
      atualizarFeedbackDoCampo(chave);
    }
    atualizarResumoDeErros();
    confirmarCorrecaoGeral();
  }

  function aoSairDoCampo(evento) {
    const chave = chaveDoControle(evento.target);
    if (!chave || estadoAtual === ESTADOS.PROCESSANDO) return;

    camposJaUsados.add(chave);
    atualizarFeedbackDoCampo(chave);
    atualizarResumoDeErros();
  }


  /* ============ 10. INÍCIO (cada listener é registrado uma única vez) ============ */

  function iniciar() {
    atualizarAssuntoCondicional();
    atualizarContador();
    definirEstado(ESTADOS.EDICAO);

    formulario.addEventListener("submit", aoEnviar);
    formulario.addEventListener("input", aoEditarCampo);
    formulario.addEventListener("focusout", aoSairDoCampo);
  }

  iniciar();
})();