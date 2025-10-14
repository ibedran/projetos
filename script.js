// Lista de Pokémon carregada da PokéAPI
let pokemonList = [];

async function carregarPokemonList() {
  const resposta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=800');
  const dados = await resposta.json();
  pokemonList = dados.results.map(p => p.name);
}

// Função de Levenshtein
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Busca tolerante com Levenshtein
function encontrarPokemon(input) {
  input = input.toLowerCase();
  let melhorMatch = null;
  let menorDistancia = Infinity;

  for (const nome of pokemonList) {
    const distancia = levenshtein(input, nome);
    if (distancia < menorDistancia && distancia <= 2) {
      menorDistancia = distancia;
      melhorMatch = nome;
    }
  }
  return melhorMatch;
}

// Busca de Pokémon com card único
async function buscarPokemon() {
  const input = document.getElementById("search").value.trim();
  if (!input) return;

  const nomeCorreto = encontrarPokemon(input);

  if (!nomeCorreto) {
    alert("Pokémon não encontrado! Verifique a ortografia.");
    return;
  }

  try {
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomeCorreto}`);
    const dados = await resposta.json();

    document.getElementById("pokedex").innerHTML = `
      <div class="pokemon-card">
        <img src="${dados.sprites.front_default}" alt="${dados.name}">
        <h2>${dados.name.charAt(0).toUpperCase() + dados.name.slice(1)}</h2>
        <p>#${dados.id}</p>
        <p>Tipo: ${dados.types.map(t => t.type.name).join(", ")}</p>
      </div>
    `;
    document.getElementById("page-info").textContent = "Resultado da busca";
  } catch (error) {
    console.error("Erro:", error);
    alert("Ocorreu um erro ao buscar o Pokémon.");
  }
}

// ---------------- CARREGAR MAIS ----------------
const pokedex = document.getElementById("pokedex");
const pageInfo = document.getElementById("page-info");

let offset = 0;       // Onde começa
const limit = 10;     // Quantos pokémons por vez
let totalPokemons = 0;

// Carregar Pokémons progressivamente
async function carregarPokemons() {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();
  totalPokemons = data.count;

  for (const p of data.results) {
    const pokeRes = await fetch(p.url);
    const pokeData = await pokeRes.json();

    const card = document.createElement("div");
    card.classList.add("pokemon-card");
    card.innerHTML = `
      <img src="${pokeData.sprites.front_default}" alt="${pokeData.name}">
      <h2>${pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1)}</h2>
      <p>#${pokeData.id}</p>
      <p>Tipo: ${pokeData.types.map(t => t.type.name).join(", ")}</p>
    `;
    pokedex.appendChild(card);
  }

  offset += limit;
  atualizarInfo();
}

// Atualizar info
function atualizarInfo() {
  pageInfo.textContent = `Carregados ${offset} de ${totalPokemons}`;
}

// Inicialização
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  carregarPokemonList();
  carregarPokemons(); 
});