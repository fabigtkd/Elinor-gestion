const db = require("./connection");

console.log("======================================");
console.log(" MIGRACION CAJONES PRODUCCION V1");
console.log("======================================");

const columnas = [
{
nombre: "cantidadDisponible",
tipo: "REAL DEFAULT 0"
},
{
nombre: "cantidadCortada",
tipo: "REAL DEFAULT 0"
},
{
nombre: "cantidadEnteraVendida",
tipo: "REAL DEFAULT 0"
},
{
nombre: "fechaCorte",
tipo: "DATETIME"
},
{
nombre: "observacionesProduccion",
tipo: "TEXT"
}
];

db.all(
"PRAGMA table_info(cajones)",
[],
function(error, existentes) {


if (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
  return;
}

agregarColumnas(existentes || [], 0);


}
);

function agregarColumnas(existentes, indice) {

if (indice >= columnas.length) {
finalizar();
return;
}

const columna = columnas[indice];

let existe = false;

for (let i = 0; i < existentes.length; i++) {


if (existentes[i].name === columna.nombre) {
  existe = true;
  break;
}


}

if (existe) {


console.log(
  "OK: " +
  columna.nombre +
  " ya existe."
);

agregarColumnas(
  existentes,
  indice + 1
);

return;


}

const sql =
"ALTER TABLE cajones ADD COLUMN " +
columna.nombre +
" " +
columna.tipo;

db.run(
sql,
[],
function(error) {


  if (error) {
    console.error(
      "ERROR creando " +
      columna.nombre +
      ": " +
      error.message
    );

    process.exit(1);
    return;
  }

  console.log(
    "OK: " +
    columna.nombre +
    " creada."
  );

  existentes.push({
    name: columna.nombre
  });

  agregarColumnas(
    existentes,
    indice + 1
  );
}


);
}

function finalizar() {

console.log("");
console.log("======================================");
console.log(" MIGRACION FINALIZADA CORRECTAMENTE");
console.log("======================================");

process.exit(0);
}
