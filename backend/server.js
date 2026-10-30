
require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

// Accueil
app.get('/', (req, res) => {
    res.send('Bienvenue sur BureauMeuble !');
});

// Tester la connexion à MongoDB
app.get('/test-db', async (req, res) => {
    try {
        await client.db('achat-meuble').command({ ping: 1 });
        res.send('Connexion à MongoDB réussie !');
    } catch (error) {
        console.error('Erreur MongoDB :', error.message);
        res.status(500).send('Impossible de se connecter à MongoDB.');
    }
});

// Récupérer la liste des meubles
app.get('/meubles', async (req, res) => {
    try {
        const collection = client.db('achat-meuble').collection('meubles');
        const listeMeubles = await collection.find({ actif: true }).toArray();

        res.json(listeMeubles);
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({
            message: 'Erreur lors de la récupération des meubles.'
        });
    }
});

// Enregistrer un meuble
app.post('/meubles', async (req, res) => {

const { nom, prixJournalier } = req.body;
if (typeof nom !== "string" || nom.trim() === "") {
    return res.status(400).json({
        message: "Le nom du meuble est obligatoire."
    });
}if ( 
    typeof prixJournalier !== "number" ||
    !Number.isFinite(prixJournalier) ||
    prixJournalier < 0
) {
    return res.status(400).json({
        message: "Le prix journalier doit être un nombre positif ou égal à zéro."
    });
}
    try {
        const collection = client.db('achat-meuble').collection('meubles');
        const nouveauMeuble = {
    ...req.body,
    actif: true
};


        const resultat = await collection.insertOne(nouveauMeuble);

        res.status(201).json({
            message: 'Meuble enregistré avec succès !',
            id: resultat.insertedId
        });
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({
            message: 'Erreur lors de l’enregistrement du meuble.'
        });
    }
});

// Récupérer un meuble par son identifiant
app.get('/meubles/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Identifiant invalide.'
            });
        }

        const collection = client.db('achat-meuble').collection('meubles');
        const meuble = await collection.findOne({
            _id: new ObjectId(id)
        });

        if (!meuble) {
            return res.status(404).json({
                message: 'Meuble introuvable.'
            });
        }

        res.json(meuble);
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({
            message: 'Erreur lors de la recherche du meuble.'
        });
    }
});

// Modifier le prix journalier d'un meuble
app.patch('/meubles/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Identifiant invalide.'
            });
        }

        const prixJournalier = req.body.prixJournalier;

        if (
            typeof prixJournalier !== 'number' ||
            !Number.isFinite(prixJournalier) ||
            prixJournalier < 0
        ) {
            return res.status(400).json({
                message: 'Le prix journalier doit être un nombre positif ou nul.'
            });
        }

        const collection = client.db('achat-meuble').collection('meubles');

        const resultat = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { prixJournalier: prixJournalier } }
        );

        if (resultat.matchedCount === 0) {
            return res.status(404).json({
                message: 'Meuble introuvable.'
            });
        }

        res.json({
            message: 'Prix journalier modifié avec succès.'
        });
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({
            message: 'Erreur lors de la modification du meuble.'
        });
    }
});

app.patch('/meubles/:id/desactiver', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Identifiant invalide.'
            });
        }

        const collection = client.db('achat-meuble').collection('meubles');

        const resultat = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { actif: false } }
        );

        if (resultat.matchedCount === 0) {
            return res.status(404).json({
                message: 'Meuble introuvable.'
            });
        }

        res.json({
            message: 'Meuble désactivé avec succès.'
        });

    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({
            message: 'Erreur lors de la désactivation du meuble.'
        });
    }
});
app.patch('/meubles/:id/activer', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Identifiant invalide.'
            });
        }

        const collection = client.db('achat-meuble').collection('meubles');

        const resultat = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { actif: true } }
        );

        if (resultat.matchedCount === 0) {
            return res.status(404).json({
                message: 'Meuble introuvable.'
            });
        }

        res.json({
            message: 'Meuble réactivé avec succès.'
        });

    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({
            message: 'Erreur lors de la réactivation du meuble.'
        });
    }
});


// Démarrer le serveur après la connexion à MongoDB
async function demarrerServeur() {
    try {
        await client.connect();
        console.log('Connexion à MongoDB réussie !');

        app.listen(3000, () => {
            console.log('Serveur démarré sur http://localhost:3000');
        });
    } catch (error) {
        console.error('Erreur au démarrage :', error.message);
    }
}

demarrerServeur();
