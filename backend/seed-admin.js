
require('dotenv').config();

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const client = new MongoClient(process.env.MONGODB_URI);

async function creerAdministrateur() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const motDePasse = process.env.ADMIN_PASSWORD;

    if (!email || !motDePasse) {
      throw new Error("ADMIN_EMAIL ou ADMIN_PASSWORD manquant dans .env");
    }

    await client.connect();

    const db = client.db('achat-meuble');
    const admins = db.collection('admins');

    // Empêcher les doublons d'adresses e-mail
    await admins.createIndex({ email: 1 }, { unique: true });

    // Vérifier si l'administrateur existe déjà
    const adminExistant = await admins.findOne({ email });

    if (adminExistant) {
      console.log("L'administrateur existe déjà.");
      return;
    }

    // Hacher le mot de passe
    const motDePasseHash = await bcrypt.hash(motDePasse, 12);

    // Enregistrer l'administrateur
    await admins.insertOne({
      email,
      passwordHash: motDePasseHash,
      role: 'admin',
      actif: true,
      dateCreation: new Date()
    });

    console.log("Administrateur créé avec succès !");
  } catch (erreur) {
    console.error("Erreur :", erreur.message);
  } finally {
    await client.close();
  }
}

creerAdministrateur();
