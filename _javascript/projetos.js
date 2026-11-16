// ===== FONTE DE DADOS DOS PROJETOS =====
// O filtro, os botões e os cards são gerados a partir daqui (ver filtro-projetos.js).

// Categorias: a chave é usada nos projetos, o valor é o texto exibido.
// Uma categoria nova aparece automaticamente no filtro.
const CATEGORIAS = {
  web: "Web",
  backend: "Back-End",
};

const projetos = [

  {
    id: 1,
    titulo: "Portfólio Responsivo",
    categoria: "web",
    descricao: "Evolução visual completa do site pessoal, utilizando folhas de estilo externas e Flexbox em menus e cards.",
    tecnologias: ["HTML Semântico", "CSS3", "Flexbox"],
    link: { texto: "Ver layout", url: "#" }
  }
];

Object.freeze(projetos);
projetos.forEach((projeto) => Object.freeze(projeto));