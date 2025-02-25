const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ramdhan'
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

// Route pour obtenir les produits
app.get('/produits', (req, res) => {
    db.query('SELECT * FROM produits', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
// Route pour rechercher les commandes avec les produits associés
app.get('/commandes', (req, res) => {
    const { nom, telephone } = req.query;

    let query = `
        SELECT 
            c.id AS commande_id,
            c.total,
            c.note,
            c.date,
            c.account,
            cl.nom AS client_nom,
            cl.telephone AS client_telephone,
            p.nom AS produit_nom,
            cp.quantite AS produit_quantite,
            p.prix AS produit_prix
        FROM commandes c
        JOIN clients cl ON c.client_id = cl.id
        JOIN commande_produits cp ON c.id = cp.commande_id
        JOIN produits p ON cp.produit_id = p.id
        WHERE 1=1
    `;

    if (nom) query += ` AND cl.nom LIKE '%${nom}%'`;
    if (telephone) query += ` AND cl.telephone LIKE '%${telephone}%'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée" });
        }

        // Structurer les résultats pour regrouper les produits par commande
        const commandes = {};
        results.forEach(row => {
            if (!commandes[row.commande_id]) {
                commandes[row.commande_id] = {
                    id: row.commande_id,
                    total: row.total,
                    note: row.note,
                    date: row.date,
                    account: row.account,
                    client: {
                        nom: row.client_nom,
                        telephone: row.client_telephone,
                    },
                    produits: []
                };
            }
            commandes[row.commande_id].produits.push({
                nom: row.produit_nom,
                quantite: row.produit_quantite,
                prix: row.produit_prix
            });
        });

        res.json(Object.values(commandes));
    });
});
// Route pour créer une commande
app.post('/commandes', (req, res) => {
    const { client, produits, total, note, account } = req.body;

    // Vérification des données requises
    if (!client || !client.nom || !client.telephone || !produits || !produits.length) {
        return res.status(400).json({ error: 'Données invalides' });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur de transaction' });
        }

        // Insérer le client
        db.query(
            'INSERT INTO clients (nom, telephone) VALUES (?, ?)',
            [client.nom, client.telephone],
            (err, clientResults) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: err.message });
                    });
                }

                const clientId = clientResults.insertId;

                // Insérer la commande avec le champ account
                db.query(
                    'INSERT INTO commandes (client_id, total, note, account) VALUES (?, ?, ?, ?)',
                    [clientId, total, note, account || null], // account peut être null si non fourni
                    (err, commandeResults) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ error: err.message });
                            });
                        }

                        const commandeId = commandeResults.insertId;
                        const produitsValues = produits.map(produit => [
                            commandeId,
                            produit.id,
                            produit.quantite
                        ]);

                        // Insérer les produits de la commande
                        db.query(
                            'INSERT INTO commande_produits (commande_id, produit_id, quantite) VALUES ?',
                            [produitsValues],
                            (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({ error: err.message });
                                    });
                                }

                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            res.status(500).json({ error: err.message });
                                        });
                                    }
                                    res.json({
                                        message: 'Commande créée avec succès',
                                        commandeId
                                    });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});
// Route pour obtenir les statistiques
app.get('/statistiques', (req, res) => {
    const { debut, fin } = req.query;
    
    // Vérification des paramètres de date
    if (!debut || !fin) {
        return res.status(400).json({ error: 'Les dates de début et de fin sont requises' });
    }
    
    // Requête SQL pour obtenir le nombre total de commandes et le chiffre d'affaires
    const statsQuery = `
        SELECT 
            COUNT(DISTINCT c.id) as totalCommandes,
            SUM(c.total) as chiffreAffaires
        FROM commandes c
        WHERE DATE(c.date) BETWEEN ? AND ?
    `;
    
    // Requête SQL pour obtenir les statistiques par produit
    const produitsQuery = `
        SELECT 
            p.id,
            p.nom,
            SUM(cp.quantite) as quantiteVendue,
            SUM(p.prix * cp.quantite) as totalVentes
        FROM produits p
        JOIN commande_produits cp ON p.id = cp.produit_id
        JOIN commandes c ON cp.commande_id = c.id
        WHERE DATE(c.date) BETWEEN ? AND ?
        GROUP BY p.id
        ORDER BY quantiteVendue DESC
    `;
    
    // Exécuter la première requête (stats globales)
    db.query(statsQuery, [debut, fin], (err, statsResults) => {
        if (err) {
            console.error("Erreur SQL (stats globales):", err);
            return res.status(500).json({ error: err.message });
        }
        
        // Exécuter la seconde requête (stats par produit)
        db.query(produitsQuery, [debut, fin], (err, produitsResults) => {
            if (err) {
                console.error("Erreur SQL (stats produits):", err);
                return res.status(500).json({ error: err.message });
            }
            
            // Combiner les résultats
            const statistics = {
                totalCommandes: statsResults[0].totalCommandes,
                chiffreAffaires: statsResults[0].chiffreAffaires,
                produitsStats: produitsResults
            };
            
            res.json(statistics);
        });
    });
});
// Import des modules nécessaires pour l'authentification
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Clé secrète pour la signature des tokens JWT (à changer en production)
const JWT_SECRET = 'votre_clé_secrète_complexe';

// Route pour la connexion
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Vérifier que les champs requis sont présents
    if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    // Requête pour trouver l'utilisateur dans la base de données
    db.query(
        'SELECT * FROM utilisateurs WHERE username = ?', 
        [username], 
        async (err, results) => {
            if (err) {
                console.error('Erreur de base de données:', err);
                return res.status(500).json({ message: 'Erreur de serveur' });
            }
            
            // Vérifier si l'utilisateur existe
            if (results.length === 0) {
                return res.status(401).json({ message: 'Identifiants incorrects' });
            }
            
            const user = results[0];
            
            try {
                // Vérifier le mot de passe
                const passwordMatch = await bcrypt.compare(password, user.password);
                
                if (!passwordMatch) {
                    return res.status(401).json({ message: 'Identifiants incorrects' });
                }
                
                // Créer le token JWT
                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    JWT_SECRET,
                    { expiresIn: '4h' } // Le token expire après 4h
                );
                
                // Envoyer le token au client
                res.json({
                    message: 'Connexion réussie',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        // Ne jamais renvoyer le mot de passe, même hashé
                    }
                });
                
            } catch (error) {
                console.error('Erreur d\'authentification:', error);
                res.status(500).json({ message: 'Erreur lors de l\'authentification' });
            }
        }
    );
});

// Middleware pour vérifier l'authentification
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Non autorisé' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }
        
        req.user = user;
        next();
    });
}

// Exemple de route protégée
app.get('/protected-route', authenticateToken, (req, res) => {
    res.json({ message: 'Accès autorisé', user: req.user });
});
// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});