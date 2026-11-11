const url = "https://pokeapi.co/api/v2/pokemon/pikachufalse";

async function main() {
    const respuesta = await fetch(url);
    console.log("status",respuesta.status);
    console.log("ok",respuesta.ok);

    const datos = await respuesta.json();
    console.log("cuerpo",datos);

    console.log("nombre",datos.name);
}
main();