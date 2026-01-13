const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Database Connection Manager
let db;

async function initDB() {
    try {
        // Connect without database first to create it
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS eshop_db');
        await connection.query('USE eshop_db');

        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                profile_pic TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Products Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert Default Admin
        await connection.query(`
            INSERT IGNORE INTO users (name, email, password, role) 
            VALUES ('Admin User', 'admin@elegance.com', 'password123', 'admin')
        `);

        db = connection;
        console.log('Database and tables initialized.');
    } catch (err) {
        console.error('Database initialization failed:', err.message);
    }
}

initDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'eshop-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Routes - Views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/shipping', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'shipping.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/admin/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/admin/add-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/admin/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin-add-product.html'));
});

// API Routes
app.get('/api/user/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
    res.json(req.session.user);
});

app.post('/api/user/update-profile', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).send('Unauthorized');
        const { profile_pic } = req.body;
        await db.execute(
            'UPDATE users SET profile_pic = ? WHERE id = ?',
            [profile_pic, req.session.user.id]
        );
        req.session.user.profile_pic = profile_pic;
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Update failed: ' + err.message);
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "user")',
            [name, email, password]
        );
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        req.session.user = rows[0];
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Error during registration: ' + err.message);
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length > 0) {
            req.session.user = rows[0];
            res.redirect('/dashboard');
        } else {
            res.send('Invalid credentials. <a href="/login">Try again</a>');
        }
    } catch (err) {
        res.status(500).send('Login error: ' + err.message);
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND password = ? AND role = "admin"',
            [email, password]
        );
        if (rows.length > 0) {
            req.session.user = rows[0];
            res.redirect('/admin/dashboard');
        } else {
            res.send('Invalid admin credentials. <a href="/admin/login">Try again</a>');
        }
    } catch (err) {
        res.status(500).send('Admin Login error: ' + err.message);
    }
});

app.post('/api/admin/add-product', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
        const { name, category, price, description, image } = req.body;
        await db.execute(
            'INSERT INTO products (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, category, price, description, image]
        );
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.status(500).send('Error adding product: ' + err.message);
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');

        const [userCount] = await db.execute('SELECT COUNT(*) as total FROM users WHERE role = "user"');
        const [productCount] = await db.execute('SELECT COUNT(*) as total FROM products');

        res.json({
            activeUsers: userCount[0].total,
            totalProducts: productCount[0].total,
            totalSales: "$12,450", // Placeholder until orders table is implemented
            pendingOrders: 5      // Placeholder
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).send('Product not found');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/checkout', (req, res) => {
    res.send('<h1>Order Placed Successfully!</h1><p>Thank you for shopping with E-Shop.</p><a href="/">Back to Home</a>');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
