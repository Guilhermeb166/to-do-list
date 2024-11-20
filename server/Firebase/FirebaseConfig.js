const admin = require("firebase-admin");

// Caminho para o arquivo JSON das credenciais
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tasks-7fd3c.firebaseio.com",
});

// Exporta o Firestore
const db = admin.firestore();
module.exports = db;