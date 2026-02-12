require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const catwayRoutes = require('./routes/catways');
const reservationRoutes = require('./routes/reservations');
const User = require('./models/User');

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/port_russell';

const ADMIN_EMAIL = 'admin@russell.com';
const ADMIN_PASSWORD = '123Russell';

const ensureAdminUser = async () => {
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

  if (!existingAdmin) {
    await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('Compte administrateur cree.');
    return;
  }

  const isExpectedPassword = await existingAdmin.comparePassword(ADMIN_PASSWORD);

  if (!isExpectedPassword) {
    existingAdmin.password = ADMIN_PASSWORD;
    await existingAdmin.save();
    console.log('Mot de passe administrateur mis a jour.');
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

app.use('/', authRoutes);
app.use('/catways', catwayRoutes);
app.use('/reservations', reservationRoutes);
app.use('/dashboard', authMiddleware);

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    userEmail: req.user.email,
    currentDate: new Date(),
  });
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
