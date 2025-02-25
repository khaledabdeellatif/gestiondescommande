const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ramdhan'
});

// Fonction pour créer un utilisateur
async function createUser(username, password) {
    try {
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insérer l'utilisateur dans la base de données
        const query = 'INSERT INTO utilisateurs (username, password) VALUES (?, ?)';
        
        db.query(query, [username, hashedPassword], (err, results) => {
            if (err) {
                console.error('Erreur lors de la création de l\'utilisateur:', err);
                return;
            }
            
            console.log('Utilisateur créé avec succès! ID:', results.insertId);
            db.end();
        });
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Créer un utilisateur (à exécuter une seule fois)
createUser('asma', 'asma');