// app.js
import {
  obtenerPokemon,
  listarPokemon,
  obtenerTipo,
} from "./pokeapi.service.js";

import {
  obtenerPersonaje,
  listarPersonajes,
  buscarPersonajes,
} from "./rickandmorty.service.js"; 

async function probarPokeApi() {
  console.log("===== PokéAPI =====");

  // Pokémon por nombre (Postman: "PokéAPI: un Pokémon")
  try {
    const pikachu = await obtenerPokemon("pikachu");
    console.log(
      `Nombre: ${pikachu.name} | Tipo: ${pikachu.types[0].type.name} | Altura: ${pikachu.height} | Peso: ${pikachu.weight}`
    );
    console.log("Imagen:", pikachu.sprites.front_default);
  } catch (error) {
    console.error("Error al pedir a pikachu:", error.message);
  }

  // Pokémon por número (Ejercicio 1: ¿el 25 es pikachu?)
  try {
    const p25 = await obtenerPokemon(25);
    console.log(`El Pokémon número 25 es: ${p25.name}`);
  } catch (error) {
    console.error("Error al pedir el Pokémon 25:", error.message);
  }

  // Listar con límite (/pokemon?limit=10)
  try {
    const lista = await listarPokemon(10);
    console.log(`\nTotal en la API: ${lista.count}. Primeros 10:`);
    lista.results.forEach((p, i) => console.log(`${i + 1}. ${p.name}`));
  } catch (error) {
    console.error("Error al listar Pokémon:", error.message);
  }

  // Por tipo (/type/fire)
  try {
    const fuego = await obtenerTipo("fire");
    console.log(`\nTipo fire: ${fuego.pokemon.length} Pokémon. Algunos:`);
    fuego.pokemon.slice(0, 5).forEach((item) => console.log("-", item.pokemon.name));
  } catch (error) {
    console.error("Error al pedir el tipo:", error.message);
  }

  // Error 404 (Postman: "404: Pokémon que no existe")
  try {
    await obtenerPokemon("pokemonfalso");
  } catch (error) {
    console.error("\nError esperado con pokemonfalso ->", error.message);
  }
}

async function probarRickAndMorty() {
  console.log("\n===== Rick and Morty (reto) =====");

  // Un personaje por id
  try {
    const rick = await obtenerPersonaje(1);
    console.log(`Personaje 1: ${rick.name} | ${rick.species} | ${rick.status}`);
  } catch (error) {
    console.error("Error al pedir el personaje:", error.message);
  }

  // Paginado: /character?page=2&status=alive (Postman: "personajes paginados")
  try {
    const pagina = await listarPersonajes(2, "alive");
    console.log(
      `\nTotal: ${pagina.info.count} | Páginas: ${pagina.info.pages} | Siguiente: ${pagina.info.next}`
    );
    pagina.results.slice(0, 5).forEach((p) => console.log("-", p.name, `(${p.status})`));
  } catch (error) {
    console.error("Error al listar personajes:", error.message);
  }

  // Buscar por nombre (Ejercicio 6: smith)
  try {
    const smiths = await buscarPersonajes("smith");
    console.log(`\nPersonajes llamados "smith": ${smiths.info.count}`);
    smiths.results.slice(0, 5).forEach((p) => console.log("-", p.name));
  } catch (error) {
    console.error("Error al buscar personajes:", error.message);
  }
}

await probarPokeApi();
await probarRickAndMorty();