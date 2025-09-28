// ===== TMDb API Configuration =====
const TMDB_API_KEY = 'e2bf84876d17e898ef5fc63655cd5040';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// ===== Movie Database with Real TMDB Data =====
const moviesDatabase = [
  {
    id: 1,
    tmdbId: 27205,
    titulo: "A Origem",
    tituloOriginal: "Inception",
    ano: 2010,
    duracao: "2h 28min",
    classificacao: "PG-13",
    poster: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    nota: 8.364,
    imdbRating: 8.4,
    rottenTomatoes: 87,
    metacritic: 74,
    generos: ["Ação", "Ficção Científica", "Aventura"],
    diretor: "Christopher Nolan",
    sinopse: "Cobb, um ladrão habilidoso que comete espionagem corporativa infiltrando-se no subconsciente de seus alvos, recebe uma chance de recuperar sua vida antiga como pagamento por uma tarefa considerada impossível: a 'origem', o implante da ideia de outra pessoa no subconsciente de um alvo.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Netflix", "Prime Video", "Apple TV+"]
  },
  {
    id: 2,
    tmdbId: 157336,
    titulo: "Interestelar",
    tituloOriginal: "Interstellar",
    ano: 2014,
    duracao: "2h 49min",
    classificacao: "PG-13",
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    nota: 8.417,
    imdbRating: 8.4,
    rottenTomatoes: 72,
    metacritic: 74,
    generos: ["Aventura", "Drama", "Ficção Científica"],
    diretor: "Christopher Nolan",
    sinopse: "As aventuras de um grupo de exploradores que fazem uso de um buraco de minhoca recém-descoberto para superar as limitações das viagens espaciais humanas e conquistar as vastas distâncias envolvidas em uma viagem interestelar.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Paramount+", "Prime Video"]
  },
  {
    id: 3,
    tmdbId: 155,
    titulo: "Batman: O Cavaleiro das Trevas",
    tituloOriginal: "The Dark Knight",
    ano: 2008,
    duracao: "2h 32min",
    classificacao: "PG-13",
    poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    nota: 8.512,
    imdbRating: 8.5,
    rottenTomatoes: 94,
    metacritic: 84,
    generos: ["Drama", "Ação", "Crime", "Thriller"],
    diretor: "Christopher Nolan",
    sinopse: "Batman intensifica sua guerra contra o crime. Com a ajuda do tenente Jim Gordon e do promotor Harvey Dent, Batman pretende desmantelar as organizações criminosas restantes que assolam as ruas. A parceria se mostra eficaz, mas eles logo se tornam presas de um reino de caos desencadeado por um gênio criminoso conhecido pelos cidadãos aterrorizados de Gotham como o Coringa.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 4,
    tmdbId: 19995,
    titulo: "Avatar",
    tituloOriginal: "Avatar",
    ano: 2009,
    duracao: "2h 42min",
    classificacao: "PG-13",
    poster: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    backdrop: "/vL5LR6WdxWPjLPFRLe133jXWsh5.jpg",
    nota: 7.573,
    imdbRating: 7.6,
    rottenTomatoes: 82,
    metacritic: 83,
    generos: ["Ação", "Aventura", "Fantasia", "Ficção Científica"],
    diretor: "James Cameron",
    sinopse: "No século 22, um fuzileiro naval paraplégico é enviado à lua Pandora em uma missão única, mas fica dividido entre seguir ordens e proteger uma civilização alienígena.",
    assistido: false,
    favorito: false,
    naLista: true,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 5,
    tmdbId: 24428,
    titulo: "Os Vingadores",
    tituloOriginal: "The Avengers",
    ano: 2012,
    duracao: "2h 23min",
    classificacao: "PG-13",
    poster: "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    backdrop: "/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg",
    nota: 7.71,
    imdbRating: 8.0,
    rottenTomatoes: 91,
    metacritic: 69,
    generos: ["Ficção Científica", "Ação", "Aventura"],
    diretor: "Joss Whedon",
    sinopse: "Quando um inimigo inesperado emerge e ameaça a segurança global, Nick Fury, diretor da agência internacional de manutenção da paz conhecida como S.H.I.E.L.D., precisa de uma equipe para tirar o mundo de volta do precipício da destruição. Abrangendo o globo, um esforço de recrutamento ousado começa!",
    assistido: true,
    favorito: false,
    naLista: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 6,
    tmdbId: 293660,
    titulo: "Deadpool",
    tituloOriginal: "Deadpool",
    ano: 2016,
    duracao: "1h 48min",
    classificacao: "R",
    poster: "/zq8Cl3PNIDGU3iWNRoc5nEZ6pCe.jpg",
    backdrop: "/en971MEXui9diirXlogOrPKmsEn.jpg",
    nota: 7.606,
    imdbRating: 8.0,
    rottenTomatoes: 85,
    metacritic: 65,
    generos: ["Ação", "Aventura", "Comédia"],
    diretor: "Tim Miller",
    sinopse: "A história de origem do ex-operador das Forças Especiais que se tornou mercenário Wade Wilson, que, depois de ser submetido a um experimento desonesto que o deixa com poderes de cura acelerada, adota o alter ego Deadpool. Armado com suas novas habilidades e um senso de humor sombrio e distorcido, Deadpool caça o homem que quase destruiu sua vida.",
    assistido: false,
    favorito: false,
    naLista: true,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 7,
    tmdbId: 299536,
    titulo: "Vingadores: Guerra Infinita",
    tituloOriginal: "Avengers: Infinity War",
    ano: 2018,
    duracao: "2h 29min",
    classificacao: "PG-13",
    poster: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    backdrop: "/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
    nota: 8.255,
    imdbRating: 8.4,
    rottenTomatoes: 85,
    metacritic: 68,
    generos: ["Aventura", "Ação", "Ficção Científica"],
    diretor: "Anthony Russo, Joe Russo",
    sinopse: "Enquanto os Vingadores e seus aliados continuaram a proteger o mundo de ameaças grandes demais para qualquer herói lidar sozinho, um novo perigo emergiu das sombras cósmicas: Thanos. Um déspota de infâmia intergaláctica, seu objetivo é coletar todas as seis Joias do Infinito, artefatos de poder inimaginável, e usá-las para infligir sua vontade distorcida sobre toda a realidade.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 8,
    tmdbId: 550,
    titulo: "Clube da Luta",
    tituloOriginal: "Fight Club",
    ano: 1999,
    duracao: "2h 19min",
    classificacao: "R",
    poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    nota: 8.438,
    imdbRating: 8.4,
    rottenTomatoes: 79,
    metacritic: 66,
    generos: ["Drama"],
    diretor: "David Fincher",
    sinopse: "Um insone bomba-relógio e um vendedor de sabão escorregadio canalizam a agressão masculina primitiva em uma nova forma chocante de terapia. Seu conceito pega, com 'clubes de luta' subterrâneos se formando em todas as cidades, até que um excêntrico atrapalha o caminho e acende uma espiral fora de controle em direção ao esquecimento.",
    assistido: true,
    favorito: false,
    naLista: false,
    streaming: ["Hulu", "Prime Video"]
  },
  {
    id: 9,
    tmdbId: 118340,
    titulo: "Guardiões da Galáxia",
    tituloOriginal: "Guardians of the Galaxy",
    ano: 2014,
    duracao: "2h 1min",
    classificacao: "PG-13",
    poster: "/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
    backdrop: "/uLtVbjvS1O7gXL8lUOwsFOH4man.jpg",
    nota: 7.906,
    imdbRating: 8.0,
    rottenTomatoes: 92,
    metacritic: 76,
    generos: ["Ação", "Ficção Científica", "Aventura"],
    diretor: "James Gunn",
    sinopse: "Anos-luz da Terra, 26 anos após ser abduzido, Peter Quill se encontra como alvo principal de uma caçada humana depois de descobrir um orbe desejado por Ronan, o Acusador.",
    assistido: false,
    favorito: false,
    naLista: true,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 10,
    tmdbId: 680,
    titulo: "Pulp Fiction: Tempo de Violência",
    tituloOriginal: "Pulp Fiction",
    ano: 1994,
    duracao: "2h 34min",
    classificacao: "R",
    poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    nota: 8.488,
    imdbRating: 8.9,
    rottenTomatoes: 92,
    metacritic: 94,
    generos: ["Thriller", "Crime"],
    diretor: "Quentin Tarantino",
    sinopse: "Um assassino amante de hambúrgueres, seu parceiro filosófico, a namorada viciada em drogas de um gângster e um boxeador em decadência convergem nesta ampla farsa criminal. Suas aventuras se desenrolam em três histórias que viajam engenhosamente para frente e para trás no tempo.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 11,
    tmdbId: 13,
    titulo: "Forrest Gump: O Contador de Histórias",
    tituloOriginal: "Forrest Gump",
    ano: 1994,
    duracao: "2h 22min",
    classificacao: "PG-13",
    poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop: "/qdIMHd4sEfJSckfVJfKQvisL02a.jpg",
    nota: 8.477,
    imdbRating: 8.8,
    rottenTomatoes: 71,
    metacritic: 82,
    generos: ["Comédia", "Drama", "Romance"],
    diretor: "Robert Zemeckis",
    sinopse: "Um homem com baixo QI realizou grandes coisas em sua vida e esteve presente durante eventos históricos significativos — em cada caso, excedendo em muito o que qualquer um imaginou que ele poderia fazer. Mas apesar de tudo o que conquistou, seu único amor verdadeiro o ilude.",
    assistido: false,
    favorito: false,
    naLista: true,
    streaming: ["Paramount+", "Prime Video"]
  },
  {
    id: 12,
    tmdbId: 671,
    titulo: "Harry Potter e a Pedra Filosofal",
    tituloOriginal: "Harry Potter and the Philosopher's Stone",
    ano: 2001,
    duracao: "2h 32min",
    classificacao: "PG",
    poster: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
    backdrop: "/hziiv14OpD73u9gAak4XDDfBKa2.jpg",
    nota: 7.916,
    imdbRating: 7.6,
    rottenTomatoes: 81,
    metacritic: 64,
    generos: ["Aventura", "Fantasia"],
    diretor: "Chris Columbus",
    sinopse: "Harry Potter viveu sob as escadas na casa de sua tia e tio por toda a vida. Mas no seu 11º aniversário, ele descobre que é um bruxo poderoso — com um lugar esperando por ele na Escola de Magia e Bruxaria de Hogwarts. Ao aprender a usar seus poderes recém-descobertos com a ajuda do bondoso diretor da escola, Harry descobre a verdade sobre a morte de seus pais — e sobre o vilão que é o culpado.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 13,
    tmdbId: 1726,
    titulo: "Homem de Ferro",
    tituloOriginal: "Iron Man",
    ano: 2008,
    duracao: "2h 6min",
    classificacao: "PG-13",
    poster: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
    backdrop: "/cyecB7godJ6kNHGONFjUyVN9OX5.jpg",
    nota: 7.64,
    imdbRating: 7.9,
    rottenTomatoes: 94,
    metacritic: 79,
    generos: ["Ação", "Ficção Científica", "Aventura"],
    diretor: "Jon Favreau",
    sinopse: "Depois de ser mantido em cativeiro em uma caverna afegã, o engenheiro bilionário Tony Stark cria uma armadura única e poderosa para lutar contra o mal.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 14,
    tmdbId: 68718,
    titulo: "Django Livre",
    tituloOriginal: "Django Unchained",
    ano: 2012,
    duracao: "2h 45min",
    classificacao: "R",
    poster: "/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg",
    backdrop: "/5Lbm0gpFDRAPIV1Cth6ln9iL1ou.jpg",
    nota: 8.171,
    imdbRating: 8.4,
    rottenTomatoes: 87,
    metacritic: 81,
    generos: ["Drama", "Western"],
    diretor: "Quentin Tarantino",
    sinopse: "Com a ajuda de um caçador de recompensas alemão, um escravo liberto parte para resgatar sua esposa de um brutal proprietário de plantação no Mississippi.",
    assistido: false,
    favorito: false,
    naLista: true,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 15,
    tmdbId: 278,
    titulo: "Um Sonho de Liberdade",
    tituloOriginal: "The Shawshank Redemption",
    ano: 1994,
    duracao: "2h 22min",
    classificacao: "R",
    poster: "/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg",
    backdrop: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    nota: 8.702,
    imdbRating: 9.3,
    rottenTomatoes: 91,
    metacritic: 80,
    generos: ["Drama", "Crime"],
    diretor: "Frank Darabont",
    sinopse: "Condenado na década de 1940 pelo duplo assassinato de sua esposa e do amante dela, o banqueiro íntegro Andy Dufresne inicia uma nova vida na prisão de Shawshank, onde coloca suas habilidades contábeis para trabalhar para um diretor desonesto. Durante sua longa permanência na prisão, Dufresne passa a ser admirado pelos outros presos — incluindo um prisioneiro mais velho chamado Red — por sua integridade e senso inabalável de esperança.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 16,
    tmdbId: 299534,
    titulo: "Vingadores: Ultimato",
    tituloOriginal: "Avengers: Endgame",
    ano: 2019,
    duracao: "3h 1min",
    classificacao: "PG-13",
    poster: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdrop: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    nota: 8.263,
    imdbRating: 8.4,
    rottenTomatoes: 94,
    metacritic: 78,
    generos: ["Aventura", "Ficção Científica", "Ação"],
    diretor: "Anthony Russo, Joe Russo",
    sinopse: "Após os eventos devastadores de Vingadores: Guerra Infinita, o universo está em ruínas devido aos esforços do Titã Louco, Thanos. Com a ajuda dos aliados restantes, os Vingadores devem se reunir mais uma vez para desfazer as ações de Thanos e restaurar a ordem ao universo de uma vez por todas, não importa quais consequências possam estar reservadas.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 17,
    tmdbId: 603,
    titulo: "Matrix",
    tituloOriginal: "The Matrix",
    ano: 1999,
    duracao: "2h 16min",
    classificacao: "R",
    poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop: "/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    nota: 8.206,
    imdbRating: 8.7,
    rottenTomatoes: 88,
    metacritic: 73,
    generos: ["Ação", "Ficção Científica"],
    diretor: "Lana Wachowski, Lilly Wachowski",
    sinopse: "Ambientado no século 22, Matrix conta a história de um hacker de computador que se junta a um grupo de insurgentes subterrâneos lutando contra os computadores vastos e poderosos que agora governam a Terra.",
    assistido: true,
    favorito: true,
    naLista: false,
    streaming: ["Max", "Netflix"]
  },
  {
    id: 18,
    tmdbId: 597,
    titulo: "Titanic",
    tituloOriginal: "Titanic",
    ano: 1997,
    duracao: "3h 14min",
    classificacao: "PG-13",
    poster: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    backdrop: "/rzdPqYx7Um4FUZeD8wpXqjAUcEm.jpg",
    nota: 7.9,
    imdbRating: 7.8,
    rottenTomatoes: 89,
    metacritic: 75,
    generos: ["Drama", "Romance"],
    diretor: "James Cameron",
    sinopse: "Rose DeWitt Bukater, de 101 anos, conta a história de sua vida a bordo do Titanic, 84 anos depois. Uma jovem Rose embarca no navio com sua mãe e noivo. Enquanto isso, Jack Dawson e Fabrizio De Rossi ganham bilhetes de terceira classe a bordo do navio. Rose conta toda a história da partida do Titanic até sua morte — em sua primeira e última viagem — em 15 de abril de 1912.",
    assistido: false,
    favorito: false,
    naLista: true,
    streaming: ["Paramount+", "Prime Video"]
  },
  {
    id: 19,
    tmdbId: 475557,
    titulo: "Coringa",
    tituloOriginal: "Joker",
    ano: 2019,
    duracao: "2h 2min",
    classificacao: "R",
    poster: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    backdrop: "/hO7KbdvGOtDdeg0W4Y5nKEHeDDh.jpg",
    nota: 8.168,
    imdbRating: 8.4,
    rottenTomatoes: 68,
    metacritic: 59,
    generos: ["Crime", "Thriller", "Drama"],
    diretor: "Todd Phillips",
    sinopse: "Durante a década de 1980, um comediante fracassado é levado à loucura e se volta para uma vida de crime e caos na Cidade de Gotham, enquanto se torna uma figura infame de crime psicopático.",
    assistido: true,
    favorito: false,
    naLista: false,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 20,
    tmdbId: 76341,
    titulo: "Mad Max: Estrada da Fúria",
    tituloOriginal: "Mad Max: Fury Road",
    ano: 2015,
    duracao: "2h 0min",
    classificacao: "R",
    poster: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
    backdrop: "/nlCHUWjY9XWbuEUQauCBgnY8ymF.jpg",
    nota: 7.582,
    imdbRating: 8.1,
    rottenTomatoes: 97,
    metacritic: 90,
    generos: ["Ação", "Aventura", "Ficção Científica"],
    diretor: "George Miller",
    sinopse: "Uma história apocalíptica situada nos confins mais distantes do nosso planeta, em uma paisagem desértica onde a humanidade está fragmentada e a maioria está enlouquecida lutando pelas necessidades da vida. Dentro deste mundo existem dois rebeldes em fuga que talvez consigam restaurar a ordem.",
    assistido: false,
    favorito: false,
    naLista: false,
    streaming: ["Max", "Prime Video"]
  }
];

// ===== DOM Elements =====
const trendingMoviesGrid = document.getElementById('trending-movies');
const recentTrack = document.getElementById('recent-track');
const recommendedMoviesGrid = document.getElementById('recommended-movies');

// ===== Utility Functions =====
function getFullImageUrl(path, isBackdrop = false) {
  if (!path) return 'https://via.placeholder.com/500x750/1a1f2e/ffffff?text=No+Image';
  
  const baseUrl = isBackdrop ? TMDB_BACKDROP_BASE_URL : TMDB_IMAGE_BASE_URL;
  return `${baseUrl}${path}`;
}

function showLoading(element) {
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      Carregando filmes...
    </div>
  `;
}

// ===== Função para Resumir Sinopse =====
function resumirSinopse(sinopse, maxLength = 150) {
  if (!sinopse) return '';
  
  // Se a sinopse já for curta, retorna ela mesma
  if (sinopse.length <= maxLength) {
    return sinopse;
  }
  
  // Divide em frases para pegar as mais importantes
  const frases = sinopse.split(/[.!?]+/).filter(frase => frase.trim().length > 0);
  
  // Tenta construir um resumo com as primeiras frases mais importantes
  let resumo = '';
  for (const frase of frases) {
    const fraseLimpa = frase.trim();
    if (resumo.length + fraseLimpa.length + 2 <= maxLength) {
      resumo += (resumo ? '. ' : '') + fraseLimpa;
    } else {
      break;
    }
  }
  
  // Se conseguiu pelo menos uma frase completa, usa ela
  if (resumo.length > 0) {
    return resumo + (resumo.endsWith('.') ? '..' : '...');
  }
  
  // Caso contrário, faz corte por caracteres (fallback)
  resumo = sinopse.substring(0, maxLength);
  
  // Encontra o último espaço completo para não cortar palavras no meio
  const ultimoEspaco = resumo.lastIndexOf(' ');
  if (ultimoEspaco > 0) {
    resumo = resumo.substring(0, ultimoEspaco);
  }
  
  // Remove pontuação final incompleta
  resumo = resumo.replace(/[,;:\-–—]$/, '');
  
  // Adiciona reticências
  return resumo + '...';
}

// ===== Sinopses Resumidas Personalizadas =====
function obterSinopsePersonalizada(movieId, sinopseOriginal) {
  // Sinopses resumidas personalizadas para os filmes principais
  const sinopsesMelhoradas = {
    1: "Um especialista em roubo de sonhos recebe a missão impossível de plantar uma ideia na mente de alguém em vez de roubá-la.",
    2: "Um pai e ex-piloto lidera uma missão interestelar para salvar a humanidade em um futuro onde a Terra está morrendo.",
    3: "Batman enfrenta seu maior desafio quando o Coringa semeia o caos em Gotham, testando os limites da justiça e da moralidade.",
    4: "Em um mundo alienígena, um ex-marine paralítico ganha uma nova vida através de um corpo Avatar, mas logo questiona sua missão.",
    5: "Quando uma ameaça global emerge, os maiores super-heróis da Terra devem unir forças pela primeira vez para salvar o mundo.",
    6: "Um mercenário com poderes de regeneração e senso de humor ácido busca vingança contra quem arruinou sua vida.",
    7: "Os Vingadores enfrentam Thanos, o Titã Louco que busca as Joias do Infinito para eliminar metade da vida no universo.",
    8: "Um homem insone encontra uma forma brutal de escapar de sua vida mundana através de um clube de luta clandestino.",
    9: "Um aventureiro espacial reúne um grupo improvável de heróis para proteger a galáxia de uma força destrutiva antiga.",
    10: "Histórias entrelaçadas de criminosos de Los Angeles se desdobram em uma narrativa não-linear repleta de violência e humor negro.",
    11: "A extraordinária jornada de vida de um homem simples que testemunha e influencia eventos históricos importantes dos EUA.",
    12: "Um menino órfão descobre ser um bruxo e ingressa em uma escola de magia, onde enfrenta o assassino de seus pais.",
    13: "Um gênio bilionário cria uma armadura tecnológica depois de ser capturado por terroristas, tornando-se um super-herói.",
    14: "Um escravo liberto se torna caçador de recompensas para resgatar sua esposa das mãos de um cruel proprietário de plantação.",
    15: "A amizade entre dois prisioneiros transcende décadas, encontrando esperança e redenção nas circunstâncias mais sombrias.",
    16: "Após a devastação causada por Thanos, os Vingadores sobreviventes buscam uma última chance de reverter o destino do universo.",
    17: "Um hacker descobre que a realidade é uma simulação e se junta a uma rebelião contra as máquinas que controlam a humanidade.",
    18: "O épico romance entre um artista pobre e uma jovem da alta sociedade no fatídico navio Titanic.",
    19: "A transformação de um comediante fracassado no icônico vilão Coringa em uma Gotham City mergulhada no caos social.",
    20: "Em um futuro apocalíptico, uma mulher guerreira e um sobrevivente fogem através do deserto em busca de redenção."
  };
  
  return sinopsesMelhoradas[movieId] || resumirSinopse(sinopseOriginal, 120);
}

// ===== API Functions =====
async function fetchMovieDetails(tmdbId) {
  if (!TMDB_API_KEY) {
    console.warn('TMDb API key não configurada, usando dados locais');
    return null;
  }
  
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=pt-BR`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
  }
  return null;
}

async function searchMovies(query) {
  if (!TMDB_API_KEY || !query) return [];
  
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      return data.results || [];
    }
  } catch (error) {
    console.error('Erro na busca de filmes:', error);
  }
  return [];
}

// ===== Initialize Homepage =====
function initHomepage() {
  if (trendingMoviesGrid) {
    renderTrendingMovies();
  }
  if (recentTrack) {
    renderRecentMovies();
  }
  if (recommendedMoviesGrid) {
    renderRecommendedMovies();
  }
  
  // Initialize carousel controls
  initCarouselControls();
  
  // Initialize filters
  initFilters();
  
  // Set featured movie with TOP 5
  setFeaturedMoviesCarousel();
}

// ===== Set Featured Movies Carousel (TOP 5) =====
let currentFeaturedIndex = 0;
let featuredRotationInterval = null;

function setFeaturedMoviesCarousel() {
  // Get top 5 movies by rating
  const top5Movies = moviesDatabase
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 5);
  
  if (top5Movies.length === 0) return;
  
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;
  
  // Clear existing interval if any
  if (featuredRotationInterval) {
    clearInterval(featuredRotationInterval);
  }
  
  // Keep existing hero content structure
  const heroBackdrop = heroSection.querySelector('.hero-backdrop img');
  const heroTitle = heroSection.querySelector('.hero-title');
  const heroSynopsis = heroSection.querySelector('.hero-synopsis');
  const heroMeta = heroSection.querySelector('.hero-meta');
  const heroBadge = heroSection.querySelector('.hero-badge');
  
  // Function to update the featured movie display with ultra-smooth transition
  function updateFeaturedMovie(index) {
    const movie = top5Movies[index];
    
    // Create subtle crossfade effect for backdrop
    if (heroBackdrop) {
      const newImg = new Image();
      newImg.onload = function() {
        // Direct backdrop update without transition
        heroBackdrop.src = getFullImageUrl(movie.backdrop, true);
        heroBackdrop.alt = movie.titulo;
        heroBackdrop.style.opacity = '0.6'; // Meio termo entre o fade forte e fraco
        heroBackdrop.style.filter = 'blur(0px)';
      };
      newImg.src = getFullImageUrl(movie.backdrop, true);
    }
    
    // Stagger text changes for seamless transition
    setTimeout(() => {
      if (heroBadge) {
        heroBadge.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        heroBadge.style.transform = 'translateY(-10px)';
        heroBadge.style.opacity = '0';
        
        setTimeout(() => {
          heroBadge.innerHTML = `TOP ${index + 1} DE HOJE`;
          heroBadge.style.transform = 'translateY(0)';
          heroBadge.style.opacity = '1';
        }, 200);
      }
    }, 200);
    
    setTimeout(() => {
      if (heroTitle) {
        heroTitle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        heroTitle.style.transform = 'translateX(-20px)';
        heroTitle.style.opacity = '0';
        
        setTimeout(() => {
          heroTitle.textContent = movie.titulo;
          heroTitle.style.transform = 'translateX(0)';
          heroTitle.style.opacity = '1';
        }, 200);
      }
    }, 400);
    
    setTimeout(() => {
      if (heroSynopsis) {
        heroSynopsis.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        heroSynopsis.style.transform = 'translateY(15px)';
        heroSynopsis.style.opacity = '0';
        
        setTimeout(() => {
          heroSynopsis.textContent = obterSinopsePersonalizada(movie.id, movie.sinopse);
          heroSynopsis.style.transform = 'translateY(0)';
          heroSynopsis.style.opacity = '1';
        }, 200);
      }
    }, 600);
    
    setTimeout(() => {
      if (heroMeta) {
        heroMeta.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        heroMeta.style.transform = 'scale(0.95)';
        heroMeta.style.opacity = '0';
        
        setTimeout(() => {
          heroMeta.innerHTML = `
            <span class="hero-year">${movie.ano}</span>
            <span class="hero-duration">${movie.duracao}</span>
            <span class="hero-rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ${(movie.nota / 2).toFixed(1)}
            </span>
          `;
          heroMeta.style.transform = 'scale(1)';
          heroMeta.style.opacity = '1';
        }, 200);
      }
    }, 800);
    
    updateIndicators(index);
  }
  
  // Add navigation indicators
  let indicatorsContainer = heroSection.querySelector('.hero-indicators');
  if (!indicatorsContainer) {
    indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'hero-indicators';
    heroSection.appendChild(indicatorsContainer);
  }
  
  indicatorsContainer.innerHTML = top5Movies.map((_, index) => `
    <button class="hero-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Ir para filme ${index + 1}"></button>
  `).join('');
  
  // Add click handlers to indicators
  const indicators = indicatorsContainer.querySelectorAll('.hero-indicator');
  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const index = parseInt(indicator.dataset.index);
      currentFeaturedIndex = index;
      updateFeaturedMovie(index);
      
      // Reset the interval
      if (featuredRotationInterval) {
        clearInterval(featuredRotationInterval);
      }
      startRotation();
    });
  });
  
  // Function to update active indicator
  function updateIndicators(activeIndex) {
    const indicators = document.querySelectorAll('.hero-indicator');
    indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
  
  // Function to start automatic rotation
  function startRotation() {
    featuredRotationInterval = setInterval(() => {
      currentFeaturedIndex = (currentFeaturedIndex + 1) % top5Movies.length;
      updateFeaturedMovie(currentFeaturedIndex);
    }, 7000); // Rotate every 7 seconds
  }
  
  // Initialize with first movie immediately to avoid flash
  updateFeaturedMovie(0);
  
  // Hide loading content and show hero
  setTimeout(() => {
    const heroContent = heroSection.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }
  }, 100);
  
  // Start automatic rotation
  startRotation();
  
  // Add cursor pointer and styling to hero section to indicate it's clickable
  heroSection.style.cursor = 'pointer';
  heroSection.style.userSelect = 'none'; // Prevent text selection
  
  // Add a subtle overlay to indicate clickability
  if (!heroSection.querySelector('.hero-click-overlay')) {
    const clickOverlay = document.createElement('div');
    clickOverlay.className = 'hero-click-overlay';
    clickOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(37, 99, 235, 0.03) 0%, 
        rgba(220, 38, 38, 0.03) 100%
      );
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      z-index: 1;
    `;
    heroSection.appendChild(clickOverlay);
  }
  
  // Pause rotation on hover (sem animação de expansão)
  heroSection.addEventListener('mouseenter', () => {
    if (featuredRotationInterval) {
      clearInterval(featuredRotationInterval);
    }
    
    // Show click overlay apenas
    const overlay = heroSection.querySelector('.hero-click-overlay');
    if (overlay) {
      overlay.style.opacity = '1';
    }
  });
  
  heroSection.addEventListener('mouseleave', () => {
    startRotation();
    
    // Hide click overlay
    const overlay = heroSection.querySelector('.hero-click-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
    }
  });
  
  // Add click functionality to hero section to go to movie details
  heroSection.addEventListener('click', (e) => {
    // Ignore clicks on indicators
    if (e.target.closest('.hero-indicators')) {
      return;
    }
    
    const currentMovie = top5Movies[currentFeaturedIndex];
    if (currentMovie) {
      // Redirect imediatamente (sem animação de clique)
      window.location.href = `html/filmes.html?id=${currentMovie.id}`;
    }
  });
}

// ===== Render Trending Movies =====
function renderTrendingMovies() {
  if (!trendingMoviesGrid) return;
  
  const trendingMovies = moviesDatabase
    .sort((a, b) => b.nota - a.nota);
  
  trendingMoviesGrid.innerHTML = trendingMovies.map(movie => createMovieCard(movie)).join('');
}

// ===== Render Recent Movies =====
function renderRecentMovies() {
  if (!recentTrack) return;
  
  const recentMovies = moviesDatabase
    .filter(movie => movie.assistido);
  
  recentTrack.innerHTML = recentMovies.map(movie => createMovieCard(movie)).join('');
}

// ===== Render Recommended Movies =====
function renderRecommendedMovies() {
  if (!recommendedMoviesGrid) return;
  
  const recommendedMovies = moviesDatabase
    .filter(movie => !movie.assistido && movie.nota >= 8.0);
  
  recommendedMoviesGrid.innerHTML = recommendedMovies.map(movie => createMovieCard(movie)).join('');
}

// ===== Create Movie Card =====
function createMovieCard(movie) {
  const posterUrl = getFullImageUrl(movie.poster);
  
  return `
    <div class="movie-card" data-id="${movie.id}">
      <div class="movie-card-poster">
        <img src="${posterUrl}" alt="${movie.titulo}" loading="lazy" />
        <div class="movie-card-overlay">
          <span class="movie-card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${(movie.nota / 2).toFixed(1)}
          </span>
        </div>
      </div>
      <div class="movie-card-info">
        <h4 class="movie-card-title">${movie.titulo}</h4>
        <span class="movie-card-year">${movie.ano}</span>
      </div>
    </div>
  `;
}

// ===== Carousel Controls =====
function initCarouselControls() {
  const carousels = document.querySelectorAll('.carousel');
  
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    
    if (!track) return;
    
    // Auto-scroll functionality
    let autoScrollInterval = null;
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 10) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: 240, behavior: 'smooth' });
        }
      }, 3000);
    };
    
    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };
    
    // Start auto-scroll
    startAutoScroll();
    
    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);
    
    // Manual controls
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const scrollAmount = 240 * 3; // Scroll 3 cards
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        stopAutoScroll();
        setTimeout(startAutoScroll, 5000);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const scrollAmount = 240 * 3; // Scroll 3 cards
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        stopAutoScroll();
        setTimeout(startAutoScroll, 5000);
      });
    }
    
    // Update button visibility based on scroll position
    const updateButtonVisibility = () => {
      if (prevBtn) {
        // Esconde o botão esquerdo quando está no início
        if (track.scrollLeft <= 10) {
          prevBtn.classList.add('hidden');
        } else {
          prevBtn.classList.remove('hidden');
        }
      }
      if (nextBtn) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        // Esconde o botão direito quando chega ao fim
        if (track.scrollLeft >= maxScroll - 10) {
          nextBtn.classList.add('hidden');
        } else {
          nextBtn.classList.remove('hidden');
        }
      }
    };
    
    track.addEventListener('scroll', updateButtonVisibility);
    // Verifica visibilidade inicial
    setTimeout(updateButtonVisibility, 100);
  });
}

// ===== Filter Functionality =====
function initFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const filterSelect = document.querySelector('.filter-select');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Filter movies based on genre
      const genre = tab.textContent.trim();
      filterMoviesByGenre(genre);
    });
  });
  
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      sortMovies(e.target.value);
    });
  }
}

// ===== Filter Movies by Genre =====
function filterMoviesByGenre(genre) {
  if (!trendingMoviesGrid) return;
  
  let filteredMovies;
  
  if (genre === 'Todos') {
    filteredMovies = moviesDatabase;
  } else {
    filteredMovies = moviesDatabase.filter(movie => 
      movie.generos.includes(genre)
    );
  }
  
  showLoading(trendingMoviesGrid);
  
  setTimeout(() => {
    trendingMoviesGrid.innerHTML = filteredMovies
      .map(movie => createMovieCard(movie))
      .join('');
  }, 300);
}

// ===== Sort Movies =====
function sortMovies(sortBy) {
  if (!trendingMoviesGrid) return;
  
  let sortedMovies = [...moviesDatabase];
  
  switch(sortBy) {
    case 'Mais populares':
      sortedMovies.sort((a, b) => b.nota - a.nota);
      break;
    case 'Melhor avaliados':
      sortedMovies.sort((a, b) => b.imdbRating - a.imdbRating);
      break;
    case 'Lançamentos':
      sortedMovies.sort((a, b) => b.ano - a.ano);
      break;
    case 'Alfabético':
      sortedMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
      break;
  }
  
  showLoading(trendingMoviesGrid);
  
  setTimeout(() => {
    trendingMoviesGrid.innerHTML = sortedMovies
      .map(movie => createMovieCard(movie))
      .join('');
  }, 300);
}

// ===== Movie Detail Page Functionality =====
function initMovieDetailPage() {
  // Movie data loading is now handled by movie_details.js
  // loadMovieDetails(); // DISABLED - using movie_details.js instead
  
  // Star rating functionality
  const stars = document.querySelectorAll('.star');
  let userRating = 0;
  
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      userRating = index + 1;
      updateStarDisplay(userRating);
    });
    
    star.addEventListener('mouseenter', () => {
      updateStarDisplay(index + 1);
    });
  });
  
  const starRating = document.querySelector('.star-rating');
  if (starRating) {
    starRating.addEventListener('mouseleave', () => {
      updateStarDisplay(userRating);
    });
  }
  
  // Action buttons functionality
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      
      // Show feedback animation
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 200);
    });
  });
  
  // Tab functionality
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update active tab button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active tab content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName) {
          content.classList.add('active');
        }
      });
    });
  });
}

// ===== Load Movie Details =====
function loadMovieDetails() {
  // Get movie ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');
  
  if (!movieId) {
    console.error('No movie ID provided in URL');
    return;
  }
  
  // Find movie in database
  const movie = moviesDatabase.find(m => m.id == movieId);
  
  if (!movie) {
    console.error('Movie not found:', movieId);
    return;
  }
  
  // Update page title
  document.title = `${movie.titulo} — Backstage`;
  
  // Update movie hero section
  updateMovieHero(movie);
  
  // Update cast section
  updateCastSection(movie);
  
  // Update similar movies section
  updateSimilarMovies(movie);
  
  // Initialize tab contents
  initTabContents(movie);
}

// ===== Update Movie Hero =====
function updateMovieHero(movie) {
  // Update backdrop
  const backdrop = document.querySelector('.movie-backdrop img');
  if (backdrop && movie.backdrop) {
    backdrop.src = getFullImageUrl(movie.backdrop, true);
    backdrop.alt = `${movie.titulo} backdrop`;
  }
  
  // Update poster
  const poster = document.querySelector('.movie-poster');
  if (poster && movie.poster) {
    poster.src = getFullImageUrl(movie.poster);
    poster.alt = `${movie.titulo} poster`;
  }
  
  // Update title and original title
  const titleEl = document.querySelector('.movie-title');
  if (titleEl) {
    titleEl.textContent = movie.titulo;
  }
  
  const originalTitleEl = document.querySelector('.movie-original-title');
  if (originalTitleEl && movie.tituloOriginal !== movie.titulo) {
    originalTitleEl.textContent = movie.tituloOriginal;
    originalTitleEl.style.display = 'block';
  } else if (originalTitleEl) {
    originalTitleEl.style.display = 'none';
  }
  
  // Update metadata
  const yearEl = document.querySelector('.movie-year');
  if (yearEl) yearEl.textContent = movie.ano;
  
  const ratingEl = document.querySelector('.movie-rating');
  if (ratingEl) ratingEl.textContent = movie.classificacao;
  
  const durationEl = document.querySelector('.movie-duration');
  if (durationEl) durationEl.textContent = movie.duracao;
  
  // Update genres
  const genresContainer = document.querySelector('.movie-genres');
  if (genresContainer) {
    genresContainer.innerHTML = movie.generos.map(genre => 
      `<span class="genre-tag">${genre}</span>`
    ).join('');
  }
  
  // Update ratings
  updateRatings(movie);
  
  // Update synopsis
  const synopsisEl = document.querySelector('.movie-synopsis p');
  if (synopsisEl) {
    synopsisEl.textContent = movie.sinopse;
  }
  
  // Update streaming services
  updateStreamingServices(movie);
}

// ===== Update Ratings =====
function updateRatings(movie) {
  // IMDb rating
  const imdbRating = document.querySelector('.rating-box.imdb .rating-value strong');
  if (imdbRating) {
    imdbRating.textContent = movie.imdbRating;
  }
  
  // Rotten Tomatoes
  const rtRating = document.querySelector('.rating-box.rotten .rating-value strong');
  if (rtRating) {
    rtRating.textContent = `${movie.rottenTomatoes}%`;
  }
  
  // Metacritic
  const metacriticRating = document.querySelector('.rating-box.metacritic .rating-value strong');
  if (metacriticRating) {
    metacriticRating.textContent = movie.metacritic;
  }
  
  // Backstage rating (convert from 10-scale to 5-scale)
  const backstageRating = document.querySelector('.rating-box.backstage .rating-value strong');
  if (backstageRating) {
    const ratingOutOf5 = (movie.nota / 2).toFixed(1);
    backstageRating.textContent = ratingOutOf5;
  }
}

// ===== Update Streaming Services =====
function updateStreamingServices(movie) {
  const streamingList = document.querySelector('.streaming-list');
  if (streamingList && movie.streaming) {
    streamingList.innerHTML = movie.streaming.map(service => `
      <a href="#" class="streaming-service">
        <span class="service-name">${service}</span>
        <span class="service-type">Streaming</span>
      </a>
    `).join('');
  }
}

// ===== Update Cast Section =====
function updateCastSection(movie) {
  // This is a simplified version. In a real app, you'd have cast data
  const castData = getCastData(movie.id);
  const castGrid = document.querySelector('.cast-grid');
  
  if (castGrid && castData) {
    castGrid.innerHTML = castData.map(member => `
      <div class="cast-card">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=100&background=667eea&color=fff" alt="${member.name}" />
        <div class="cast-info">
          <span class="actor-name">${member.name}</span>
          <span class="character-name">${member.character}</span>
        </div>
      </div>
    `).join('');
  }
}

// ===== Get Cast Data =====
function getCastData(movieId) {
  // Simplified cast data for different movies
  const castDatabase = {
    1: [ // Inception
      { name: "Leonardo DiCaprio", character: "Dom Cobb" },
      { name: "Marion Cotillard", character: "Mal" },
      { name: "Tom Hardy", character: "Eames" },
      { name: "Elliot Page", character: "Ariadne" }
    ],
    2: [ // Interstellar
      { name: "Matthew McConaughey", character: "Cooper" },
      { name: "Anne Hathaway", character: "Brand" },
      { name: "Jessica Chastain", character: "Murph" },
      { name: "Michael Caine", character: "Professor Brand" }
    ],
    3: [ // The Dark Knight
      { name: "Christian Bale", character: "Bruce Wayne / Batman" },
      { name: "Heath Ledger", character: "The Joker" },
      { name: "Aaron Eckhart", character: "Harvey Dent" },
      { name: "Gary Oldman", character: "James Gordon" }
    ],
    4: [ // Avatar
      { name: "Sam Worthington", character: "Jake Sully" },
      { name: "Zoe Saldana", character: "Neytiri" },
      { name: "Sigourney Weaver", character: "Dr. Grace Augustine" },
      { name: "Stephen Lang", character: "Colonel Miles Quaritch" }
    ],
    5: [ // The Avengers
      { name: "Robert Downey Jr.", character: "Tony Stark / Iron Man" },
      { name: "Chris Evans", character: "Steve Rogers / Captain America" },
      { name: "Scarlett Johansson", character: "Natasha Romanoff / Black Widow" },
      { name: "Chris Hemsworth", character: "Thor" }
    ],
    6: [ // Deadpool
      { name: "Ryan Reynolds", character: "Wade Wilson / Deadpool" },
      { name: "Morena Baccarin", character: "Vanessa" },
      { name: "Ed Skrein", character: "Ajax" },
      { name: "T.J. Miller", character: "Weasel" }
    ],
    7: [ // Avengers: Infinity War
      { name: "Robert Downey Jr.", character: "Tony Stark / Iron Man" },
      { name: "Chris Hemsworth", character: "Thor" },
      { name: "Josh Brolin", character: "Thanos" },
      { name: "Chris Evans", character: "Steve Rogers / Captain America" }
    ],
    8: [ // Fight Club
      { name: "Brad Pitt", character: "Tyler Durden" },
      { name: "Edward Norton", character: "The Narrator" },
      { name: "Helena Bonham Carter", character: "Marla Singer" },
      { name: "Meat Loaf", character: "Robert Paulson" }
    ],
    9: [ // Guardians of the Galaxy
      { name: "Chris Pratt", character: "Peter Quill / Star-Lord" },
      { name: "Zoe Saldana", character: "Gamora" },
      { name: "Dave Bautista", character: "Drax" },
      { name: "Bradley Cooper", character: "Rocket (voice)" }
    ],
    10: [ // Pulp Fiction
      { name: "John Travolta", character: "Vincent Vega" },
      { name: "Samuel L. Jackson", character: "Jules Winnfield" },
      { name: "Uma Thurman", character: "Mia Wallace" },
      { name: "Bruce Willis", character: "Butch Coolidge" }
    ]
  };
  
  return castDatabase[movieId] || [];
}

// ===== Update Similar Movies =====
function updateSimilarMovies(movie) {
  // Find movies with similar genres
  const similarMovies = moviesDatabase
    .filter(m => m.id !== movie.id && m.generos.some(g => movie.generos.includes(g)))
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 4);
  
  const similarGrid = document.querySelector('.similar-grid');
  if (similarGrid) {
    similarGrid.innerHTML = similarMovies.map(m => `
      <div class="movie-card" data-id="${m.id}">
        <img src="${getFullImageUrl(m.poster)}" alt="${m.titulo}" />
        <div class="movie-card-overlay">
          <span class="movie-card-rating">★ ${(m.nota / 2).toFixed(1)}</span>
        </div>
        <div class="movie-card-info">
          <h4 class="movie-card-title">${m.titulo}</h4>
          <span class="movie-card-year">${m.ano}</span>
        </div>
      </div>
    `).join('');
  }
}

// ===== Initialize Tab Contents =====
function initTabContents(movie) {
  // Initialize Cast Tab
  initCastTab(movie);
  
  // Initialize Reviews Tab
  initReviewsTab(movie);
  
  // Initialize Media Tab
  initMediaTab(movie);
  
  // Initialize Similar Movies Tab
  initSimilarTab(movie);
}

// ===== Initialize Cast Tab =====
function initCastTab(movie) {
  const castData = getCastData(movie.id);
  const castGridFull = document.querySelector('.cast-grid-full');
  
  if (castGridFull && castData) {
    // Add more cast members for full view
    const extendedCast = [
      ...castData,
      // Add some generic cast members for demonstration
      { name: "Supporting Actor 1", character: "Supporting Role" },
      { name: "Supporting Actor 2", character: "Supporting Role" },
      { name: "Supporting Actor 3", character: "Supporting Role" },
      { name: "Supporting Actor 4", character: "Supporting Role" }
    ];
    
    castGridFull.innerHTML = extendedCast.map(member => `
      <div class="cast-card-full">
        <div class="cast-photo">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=120&background=667eea&color=fff" alt="${member.name}" />
        </div>
        <div class="cast-info-full">
          <h4 class="actor-name">${member.name}</h4>
          <p class="character-name">${member.character}</p>
        </div>
      </div>
    `).join('');
  }
}

// ===== Initialize Reviews Tab =====
function initReviewsTab(movie) {
  const reviewsListFull = document.querySelector('.reviews-list-full');
  
  if (reviewsListFull) {
    // Sample reviews data
    const reviews = generateSampleReviews(movie);
    
    reviewsListFull.innerHTML = reviews.map(review => `
      <article class="review-card-full">
        <div class="review-header-full">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=${review.color}&color=fff&size=60" alt="${review.author}" class="reviewer-avatar-full" />
          <div class="reviewer-info-full">
            <div class="reviewer-main">
              <span class="reviewer-name-full">${review.author}</span>
              <div class="review-rating-full">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
            </div>
            <div class="review-meta-full">
              <span class="review-date-full">${review.date}</span>
              <span class="review-spoiler ${review.spoiler ? 'has-spoiler' : ''}">${review.spoiler ? 'Contém Spoilers' : 'Sem Spoilers'}</span>
            </div>
          </div>
        </div>
        <div class="review-content-full">
          <p class="review-text-full">${review.text}</p>
        </div>
        <div class="review-actions-full">
          <button class="review-action-btn like-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 10v12l4-2 5 2V10l-9-6-9 6 4 2z"/>
            </svg>
            ${review.likes}
          </button>
          <button class="review-action-btn comment-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            Responder
          </button>
        </div>
      </article>
    `).join('');
  }
}

// ===== Generate Sample Reviews =====
function generateSampleReviews(movie) {
  const reviewTexts = [
    "Uma obra-prima cinematográfica que redefine os limites da narrativa. A direção é impecável e cada cena é cuidadosamente construída para criar uma experiência única.",
    "Visualmente impressionante com uma trilha sonora épica. Embora seja um pouco complexo na primeira visualização, vale muito a pena revisitar.",
    "Este filme me deixou completamente hipnotizado do início ao fim. A atuação é fenomenal e a história é contada de forma magistral.",
    "Embora seja tecnicamente impressionante, achei a narrativa um pouco confusa em alguns momentos. Ainda assim, é uma experiência cinematográfica memorável.",
    "Um filme que te faz pensar por dias após assistir. A profundidade temática e a execução técnica são de outro nível."
  ];
  
  const authors = ["Maria Santos", "João Silva", "Ana Costa", "Pedro Lima", "Carla Ferreira"];
  const colors = ["667eea", "764ba2", "f093fb", "f5576c", "4facfe"];
  const dates = ["há 2 dias", "há 1 semana", "há 2 semanas", "há 1 mês", "há 2 meses"];
  
  return reviewTexts.map((text, index) => ({
    author: authors[index],
    text: text,
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
    date: dates[index],
    likes: Math.floor(Math.random() * 200) + 10,
    color: colors[index],
    spoiler: Math.random() > 0.7
  }));
}

// ===== Initialize Media Tab =====
function initMediaTab(movie) {
  const mediaGrid = document.querySelector('.media-grid');
  
  if (mediaGrid) {
    // Generate sample photos based on movie backdrop
    const photos = Array.from({length: 8}, (_, i) => ({
      url: getFullImageUrl(movie.backdrop, true),
      alt: `${movie.titulo} - Foto ${i + 1}`
    }));
    
    mediaGrid.innerHTML = photos.map(photo => `
      <div class="media-item">
        <img src="${photo.url}" alt="${photo.alt}" />
        <div class="media-overlay">
          <button class="media-expand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }
}

// ===== Initialize Similar Tab =====
function initSimilarTab(movie) {
  const similarMovies = moviesDatabase
    .filter(m => m.id !== movie.id && m.generos.some(g => movie.generos.includes(g)))
    .sort((a, b) => b.nota - a.nota);
  
  const similarGridFull = document.querySelector('.similar-grid-full');
  if (similarGridFull) {
    similarGridFull.innerHTML = similarMovies.map(m => `
      <div class="movie-card-similar" data-id="${m.id}">
        <div class="movie-poster-similar">
          <img src="${getFullImageUrl(m.poster)}" alt="${m.titulo}" />
        </div>
        <div class="movie-info-similar">
          <h4 class="movie-title-similar">${m.titulo}</h4>
          <div class="movie-meta-similar">
            <span class="movie-year-similar">${m.ano}</span>
            <span class="movie-rating-similar">★ ${(m.nota / 2).toFixed(1)}</span>
          </div>
          <p class="movie-genres-similar">${m.generos.join(', ')}</p>
          <p class="movie-synopsis-similar">${resumirSinopse(m.sinopse, 100)}</p>
        </div>
      </div>
    `).join('');
  }
}

// ===== Update Star Display =====
function updateStarDisplay(rating) {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// ===== Enhanced Search Functionality =====
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  
  if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm.length >= 2) {
        // Local search first
        const localResults = moviesDatabase.filter(movie => 
          movie.titulo.toLowerCase().includes(searchTerm) ||
          movie.diretor.toLowerCase().includes(searchTerm) ||
          movie.generos.some(g => g.toLowerCase().includes(searchTerm))
        );
        
        // If API key is available, search TMDb as well
        let apiResults = [];
        if (TMDB_API_KEY) {
          apiResults = await searchMovies(searchTerm);
        }
        
        console.log('Resultados da busca:', { local: localResults, api: apiResults });
        
        // Display search results in trending section for demo
        if (trendingMoviesGrid && localResults.length > 0) {
          trendingMoviesGrid.innerHTML = localResults
            .map(movie => createMovieCard(movie))
            .join('');
        }
      } else if (searchTerm.length === 0) {
        // Reset to trending movies
        renderTrendingMovies();
      }
    }, 300));
  }
}

// ===== Utility: Debounce =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== Refresh Button =====
function initRefreshButton() {
  const refreshBtn = document.querySelector('.refresh-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (!recommendedMoviesGrid) return;
      
      // Shuffle and re-render recommendations
      const shuffled = [...moviesDatabase]
        .filter(movie => !movie.assistido)
        .sort(() => Math.random() - 0.5);
      
      recommendedMoviesGrid.style.opacity = '0.5';
      
      setTimeout(() => {
        recommendedMoviesGrid.innerHTML = shuffled
          .map(movie => createMovieCard(movie))
          .join('');
        recommendedMoviesGrid.style.opacity = '1';
      }, 300);
    });
  }
}

// ===== Image Loading Error Handler =====
function handleImageError(img) {
  img.src = 'https://via.placeholder.com/500x750/1a1f2e/ffffff?text=Poster+Indisponível';
  img.onerror = null;
}

// ===== Make moviesDatabase and API config available globally for other scripts =====
window.moviesDatabase = moviesDatabase;
window.TMDB_API_KEY = TMDB_API_KEY;
window.TMDB_BASE_URL = TMDB_BASE_URL;
window.TMDB_IMAGE_BASE_URL = TMDB_IMAGE_BASE_URL;
window.TMDB_BACKDROP_BASE_URL = TMDB_BACKDROP_BASE_URL;

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
  // Check which page we're on
  const isHomepage = document.getElementById('trending-movies');
  const isMovieDetail = document.querySelector('.movie-hero');
  
  if (isHomepage) {
    initHomepage();
    initSearch();
    initRefreshButton();
  }
  
  if (isMovieDetail) {
    initMovieDetailPage();
  }
  
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Add loading animation for images with error handling
  document.addEventListener('load', (e) => {
    if (e.target.tagName === 'IMG') {
      e.target.style.animation = 'fadeIn 0.5s ease';
      e.target.onerror = () => handleImageError(e.target);
    }
  }, true);
  
  // Add hover effect for movie cards
  document.addEventListener('click', (e) => {
    if (e.target.closest('.movie-card')) {
      const card = e.target.closest('.movie-card');
      const movieId = card.dataset.id;
      
      // Redirect to movie detail page
      window.location.href = `html/filmes.html?id=${movieId}`;
    }
  });
  
  // Show API key warning if not configured
  if (!TMDB_API_KEY) {
    console.warn(`
      🎬 Para usar imagens reais dos filmes, configure sua chave da API do TMDb:
      1. Acesse: https://www.themoviedb.org/settings/api
      2. Obtenha sua chave da API
      3. Adicione na variável TMDB_API_KEY no arquivo main.js
    `);
  }
  
  // Initialize news dropdown
  initNewsDropdown();
});

// ===== News Dropdown Functionality =====
function initNewsDropdown() {
  const newsDropdownContent = document.querySelector('.news-dropdown-content');
  
  if (!newsDropdownContent) return;
  
  // Sample news data
  const newsData = [
    {
      id: 1,
      title: 'Christopher Nolan anuncia novo filme épico de ficção científica para 2025',
      category: 'Cinema',
      date: 'Há 2 horas',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=150&fit=crop'
    },
    {
      id: 2,
      title: 'Marvel revela primeira imagem do novo Quarteto Fantástico',
      category: 'Marvel',
      date: 'Há 4 horas',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&h=150&fit=crop'
    },
    {
      id: 3,
      title: 'Oscar 2024: Confira a lista completa de indicados',
      category: 'Premiação',
      date: 'Há 6 horas',
      image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=200&h=150&fit=crop'
    },
    {
      id: 4,
      title: 'Netflix anuncia segunda temporada de série mais vista de 2024',
      category: 'Streaming',
      date: 'Há 8 horas',
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=150&fit=crop'
    },
    {
      id: 5,
      title: 'Duna 3 já está em desenvolvimento, confirma diretor',
      category: 'Cinema',
      date: 'Há 12 horas',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&h=150&fit=crop'
    }
  ];
  
  // Populate dropdown
  newsDropdownContent.innerHTML = newsData.map(news => `
    <a href="noticias.html#${news.id}" class="news-dropdown-item">
      <img src="${news.image}" alt="${news.title}" class="news-thumbnail" />
      <div class="news-item-content">
        <h4 class="news-item-title">${news.title}</h4>
        <div class="news-item-meta">
          <span class="news-category">${news.category}</span>
          <span>${news.date}</span>
        </div>
      </div>
    </a>
  `).join('');
}