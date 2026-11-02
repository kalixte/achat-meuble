const cors = require('cors');
require('dotenv').config();

const express = require('express');

const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());

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
        const filtre = { actif: true };

const { categorie, prixMax } = req.query;

if (categorie) {
    filtre.categorie = categorie.trim().toLowerCase();
}

if (prixMax !== undefined) {
    const prix = Number(prixMax);

    if (!Number.isFinite(prix) || prix < 0) {
        return res.status(400).json({
            message: "Le prix maximal doit être un nombre positif ou nul."
        });
    }

    filtre.prixJournalier = { $lte: prix };
}

const meubles = await collection.find(filtre).toArray();

return res.status(200).json(meubles);
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({
            message: 'Erreur lors de la récupération des meubles.'
        });
    }
});

// Enregistrer un meuble

app.post('/meubles', async (req, res) => {
    const { nom, prixJournalier, categorie } = req.body;
    // Log des données reçues pour le débogage a suprrimer après le débogage
    console.log("Données reçues :", req.body);
console.log("Nom reçu :", nom);
console.log("Type du nom :", typeof nom);

    try {
        // 1. Vérification du nom
        if (typeof nom !== "string" || nom.trim() === "") {
            return res.status(400).json({
                message: "Le nom du meuble est obligatoire."
            });
        }

        // 2. Vérification du prix
        if (
            typeof prixJournalier !== "number" ||
            !Number.isFinite(prixJournalier) ||
            prixJournalier < 0
        ) {
            return res.status(400).json({
                message: "Le prix journalier doit être un nombre positif ou égal à zéro."
            });
        }
        const categories = ["salon", "chambre", "cuisine", "bureau"];
        
// Vérification de la catégorie
if (
    typeof categorie !== "string" || !categories.includes(categorie.trim().toLowerCase())
) {
    return res.status(400).json({
        message: "Catégorie de meuble invalide."
    });
}
        // 3. Préparation du meuble
        const collection = client.db('achat-meuble').collection('meubles');

        const nouveauMeuble = {
            nom: nom.trim(),
            prixJournalier: prixJournalier,
            categorie: categorie.trim().toLowerCase(),
            actif: true
        };

        // 4. Enregistrement dans MongoDB
        const resultat = await collection.insertOne(nouveauMeuble);

        // 5. Réponse au client
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
//route pour rehercher un meuble par son nom
app.get('/meubles/recherche', async (req, res) => {
    try {
        const collection = client.db('achat-meuble').collection('meubles');
        const nomRecherche = req.query.nom;


        if (!nomRecherche || nomRecherche.trim() === '') {
            return res.status(400).json({
                message: "Veuillez saisir un nom de meuble"
            });
        }

        const meubles = await collection.find({
            nom: {
                $regex: nomRecherche,
                $options: "i"
            },
            actif: true
        }).toArray();

        res.status(200).json(meubles);

    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
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
// route pour supprimer
app.delete('/meubles/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Vérifier le format de l'identifiant
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Identifiant invalide."
            });
        }

        // 2. Récupérer la collection
        const collection = client.db('achat-meuble').collection('meubles');

        // 3. Supprimer le meuble
        const resultat = await collection.deleteOne({
            _id: new ObjectId(id)
        });
            
        // 4. Vérifier si un meuble a été supprimé
        if (resultat.deletedCount === 0) {
            return res.status(404).json({
                message: "Aucun meuble trouvé avec cet identifiant."
            });
        }

        // 5. Confirmer la suppression
        return res.status(200).json({
            message: "Meuble supprimé avec succès."
        });

    } catch (erreur) {
        console.error(erreur);

        return res.status(500).json({
            message: "Erreur interne du serveur."
        });
    }
});
// Enregistrer un client
app.post('/clients', async (req, res) => {
    try {
        const { nom, prenom, telephone } = req.body;

        // Vérifier le nom
        if (typeof nom !== "string" || nom.trim() === "") {
            return res.status(400).json({
                message: "Le nom du client est obligatoire."
            });
        }

        // Vérifier le prénom
        if (typeof prenom !== "string" || prenom.trim() === "") {
            return res.status(400).json({
                message: "Le prénom du client est obligatoire."
            });
        }

        // Vérifier le téléphone
        if (typeof telephone !== "string" || telephone.trim() === "") {
            return res.status(400).json({
                message: "Le numéro de téléphone est obligatoire."
            });
        }

        const collection = client.db('achat-meuble').collection('clients');

        const nouveauClient = {
            nom: nom.trim(),
            prenom: prenom.trim(),
            telephone: telephone.trim(),
            actif: true
        };

        const resultat = await collection.insertOne(nouveauClient);

        return res.status(201).json({
            message: "Client enregistré avec succès !",
            id: resultat.insertedId
        });

    } catch (erreur) {
        console.error("Erreur :", erreur.message);

        return res.status(500).json({
            message: "Erreur lors de l'enregistrement du client."
        });
    }
});
// Récupérer la liste des clients
app.get('/clients', async (req, res) => {
    try {
        const collection = client.db('achat-meuble').collection('clients');

        const clients = await collection.find({ actif: true }).toArray();

        return res.status(200).json(clients);

    } catch (erreur) {
        console.error("Erreur :", erreur.message);

        return res.status(500).json({
            message: "Erreur lors de la récupération des clients."
        });
    }
});
// Enregistrer une location
app.post('/locations', async (req, res) => {
    try {
        const { clientId, meubleId, dateDebut, dateFin } = req.body;

        // 1. Vérifier les identifiants
        if (!ObjectId.isValid(clientId) || !ObjectId.isValid(meubleId)) {
            return res.status(400).json({
                message: "Identifiant du client ou du meuble invalide."
            });
        }

        // 2. Vérifier les dates
        if (!dateDebut || !dateFin) {
            return res.status(400).json({
                message: "Les dates de début et de fin sont obligatoires."
            });
        }

        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);

        if (
            Number.isNaN(debut.getTime()) ||
            Number.isNaN(fin.getTime()) ||
            debut.toISOString().slice(0, 10) !== dateDebut ||
            fin.toISOString().slice(0, 10) !== dateFin ||
            debut >= fin
        ) {
            return res.status(400).json({
                message: "Les dates sont invalides ou la date de fin doit être postérieure à la date de début."
            });
        }

        const db = client.db('achat-meuble');

        // 3. Vérifier que le client existe et est actif
        const clientTrouve = await db.collection('clients').findOne({
            _id: new ObjectId(clientId),
            actif: true
        });

        if (!clientTrouve) {
            return res.status(404).json({
                message: "Client introuvable ou inactif."
            });
        }

        // 4. Vérifier que le meuble existe et est actif
        const meuble = await db.collection('meubles').findOne({
            _id: new ObjectId(meubleId),
            actif: true
        });

        if (!meuble) {
            return res.status(404).json({
                message: "Meuble introuvable ou inactif."
            });
        }
        // Vérifier la disponibilité du meuble
const locationExistante = await db.collection('locations').findOne({
    meubleId: new ObjectId(meubleId),
    statut: "en cours",
    dateDebut: { $lt: dateFin },
    dateFin: { $gt: dateDebut }
});

if (locationExistante) {
    return res.status(409).json({
        message: "Ce meuble est déjà loué pendant cette période."
    });
}

        // 5. Calculer le montant de la location
        const nombreJours = (fin - debut) / (1000 * 60 * 60 * 24);
        const montantTotal = nombreJours * meuble.prixJournalier;

        // 6. Préparer la location
        const nouvelleLocation = {
            clientId: new ObjectId(clientId),
            meubleId: new ObjectId(meubleId),
            dateDebut,
            dateFin,
            nombreJours,
            prixJournalier: meuble.prixJournalier,
            montantTotal,
            statut: "en cours",
            dateCreation: new Date()
        };

        // 7. Enregistrer dans MongoDB
        const resultat = await db.collection('locations').insertOne(
            nouvelleLocation
        );

        return res.status(201).json({
            message: "Location enregistrée avec succès !",
            id: resultat.insertedId,
            location: nouvelleLocation
        });

    } catch (erreur) {
        console.error("Erreur lors de la création de la location :", erreur);

        return res.status(500).json({
            message: "Erreur lors de l'enregistrement de la location."
        });
    }
});
// Afficher toutes les locations
app.get('/locations', async (req, res) => {
    try {
        const collection = client.db('achat-meuble').collection('locations');

        const locations = await collection.find({}).toArray();

        return res.status(200).json(locations);

    } catch (erreur) {
        console.error("Erreur lors de la récupération des locations :", erreur);

        return res.status(500).json({
            message: "Erreur lors de la récupération des locations."
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
