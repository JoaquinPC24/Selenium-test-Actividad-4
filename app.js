const express = require('express');
const db = require('./database');
const app = express();

// 1. CONFIGURACIÓN INICIAL (DEBE IR PRIMERO)
app.use(express.static('public')); // Para el CSS
app.use(express.urlencoded({ extended: true })); // Para leer formularios POST
app.use(express.json()); 
app.set('view engine', 'ejs');

// --- RUTAS DE USUARIO ---

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (password && password.length < 8) {
        return res.render('register', { error: "La contraseña debe tener al menos 8 caracteres." });
    }
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, password], (err) => {
        if (err) return res.render('register', { error: "El correo ya está registrado." });
        res.redirect('/login'); 
    });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(query, [email, password], (err, row) => {
        if (err || !row) {
            return res.render('login', { error: "Credenciales incorrectas." });
        }
        res.redirect('/dashboard');
    });
});

// --- RUTAS DE PRODUCTOS ---

app.get('/dashboard', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        // Pasamos 'error: null' por defecto para que EJS no falle
        res.render('dashboard', { products: rows || [], error: null });
    });
});

app.post('/add-product', (req, res) => {
    const { nombre, cantidad, precio } = req.body;

    // 1. Validaciones de Servidor (Capa de Seguridad)
    if (!nombre || nombre.trim() === "") {
        console.log("❌ Intento de insertar nombre vacío");
        return res.render('dashboard', { 
            products: [], // O cargar los productos actuales de la DB
            error: "El nombre del producto es obligatorio." 
        });
    }

    if (isNaN(cantidad) || cantidad <= 0) {
        console.log("❌ Cantidad inválida:", cantidad);
        return res.status(400).send("La cantidad debe ser un número mayor a 0.");
    }

    if (isNaN(precio) || precio <= 0) {
        console.log("❌ Precio inválido:", precio);
        return res.status(400).send("El precio debe ser un número mayor a 0.");
    }

    // 2. Si pasa las validaciones, procedemos al INSERT
    const query = `INSERT INTO products (nombre, cantidad, precio) VALUES (?, ?, ?)`;
    
    db.run(query, [nombre.trim(), cantidad, precio], function(err) {
        if (err) {
            console.error("❌ Error de Base de Datos:", err.message);
            return res.status(500).send("Error interno al guardar el producto.");
        }
        
        console.log(`✅ Producto '${nombre}' añadido correctamente (ID: ${this.lastID})`);
        res.redirect('/dashboard');
    });
});

app.get('/edit-product/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.send("Producto no encontrado");
        res.render('edit', { product: row });
    });
});

app.post('/edit-product/:id', (req, res) => {
    const { nombre, cantidad, precio } = req.body;
    const { id } = req.params;
    db.run(`UPDATE products SET nombre=?, cantidad=?, precio=? WHERE id=?`,
           [nombre, cantidad, precio, id], () => res.redirect('/dashboard'));
});

app.get('/delete-product/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM products WHERE id = ?", id, () => res.redirect('/dashboard'));
});

app.get('/logout', (req, res) => {
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log("🔥 SERVIDOR CORRIENDO EN http://localhost:3000");
});