const url = "https://pokeapi.co/api/v2/pokemon/pikachu";

async function main() {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    console.log("nombre",datos.name);
    console.log("abilities",datos.abilities[1].ability.name);

    console.log("altura",datos.height);
    console.log("peso",datos.weight);
    console.log("tipo",datos.types[0].type.name);

    //pokemon que no existe y el status de la respuesta
}

main();