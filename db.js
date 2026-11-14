import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "tienda",
  decimalNumbers: true, // devuelve precio como número y no como texto
});