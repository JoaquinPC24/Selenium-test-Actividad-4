const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./inventario.sqlite');

db.serialize(() => {
    // Tabla de Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // Tabla de Productos con las restricciones de tu diseño
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        cantidad INTEGER NOT NULL CHECK(cantidad >= 0), -- No negativos
        precio REAL NOT NULL CHECK(precio > 0),         -- No cero ni negativos
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});
console.log("✅ Base de datos lista con tabla de productos.");
module.exports = db;