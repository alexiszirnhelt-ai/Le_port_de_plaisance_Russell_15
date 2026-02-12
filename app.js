require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const catwayRoutes = require('./routes/catways');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');
const User = require('./models/User');

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/port_russell';

const ADMIN_EMAIL = 'admin@russell.com';
const ADMIN_PASSWORD = '123Russell';
const ADMIN_USERNAME = 'admin';

const ensureAdminUser = async () => {
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

  if (!existingAdmin) {
    await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('Compte administrateur cree.');
    return;
  }

  let mustSave = false;

  if (!existingAdmin.username) {
    existingAdmin.username = ADMIN_USERNAME;
    mustSave = true;
  }

  const isExpectedPassword = await existingAdmin.comparePassword(ADMIN_PASSWORD);

  if (!isExpectedPassword) {
    existingAdmin.password = ADMIN_PASSWORD;
    mustSave = true;
  }

  if (mustSave) {
    await existingAdmin.save();
    console.log('Compte administrateur mis a jour.');
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api-docs', (req, res) => {
  res.type('html').send(`
    <h1>Documentation API</h1>
    <ul>
      <li>POST /login</li>
      <li>POST /logout</li>
      <li>GET /catways</li>
      <li>GET /catways/:id</li>
      <li>POST /catways</li>
      <li>PUT /catways/:id</li>
      <li>DELETE /catways/:id</li>
      <li>GET /reservations</li>
      <li>GET /reservations/:id</li>
      <li>POST /reservations</li>
      <li>PUT /reservations/:id</li>
      <li>DELETE /reservations/:id</li>
      <li>GET /users</li>
      <li>GET /users/:id</li>
      <li>POST /users</li>
      <li>PUT /users/:id</li>
      <li>DELETE /users/:id</li>
    </ul>
  `);
});

app.use('/', authRoutes);
app.use('/catways', catwayRoutes);
app.use('/reservations', reservationRoutes);
app.use('/users', authMiddleware, userRoutes);
app.use('/dashboard', authMiddleware);

app.get('/dashboard', (req, res) => {
  const email = req.user.email || '';
  const rawName = req.user.username || email.split('@')[0] || 'Utilisateur';
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  res.render('dashboard', {
    userName,
    userEmail: email,
    currentDate: new Date(),
  });
});

app.get('/dashboard/catways', (req, res) => {
  res.render('catways');
});

app.get('/dashboard/reservations', (req, res) => {
  res.render('reservations');
});

app.get('/dashboard/users', (req, res) => {
  res.render('users');
});

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Connexion a MongoDB reussie');
    await ensureAdminUser();
    app.listen(PORT, () => {
      console.log(`Serveur demarre sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erreur de connexion a MongoDB :', error.message);
    process.exit(1);
  });
