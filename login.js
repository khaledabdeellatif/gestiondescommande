// Fonction pour vérifier la validité du token
function isTokenValid() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        // Récupérer la date d'expiration du token
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        if (!tokenExpiry) return false;

        // Vérifier si le token a expiré
        const now = new Date().getTime();
        if (now > parseInt(tokenExpiry)) {
            // Si le token a expiré, le supprimer
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiry');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return false;
    }
}

// Fonction pour gérer la soumission du formulaire de connexion
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...';
    
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur de connexion');
        }
        
        const data = await response.json();
        
        // Stocker le token et sa date d'expiration
        localStorage.setItem('token', data.token);
        
        // Définir l'expiration à 5 heures à partir de maintenant
        const expiryTime = new Date().getTime() + (5 * 60 * 60 * 1000); // 5 heures en millisecondes
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        showToast('Connexion réussie !', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Erreur:', error);
        showToast(error.message || 'Erreur lors de la connexion', 'error');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se Connecter';
    }
}

// Fonction pour afficher les notifications toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Vérifier la connexion au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    if (isTokenValid()) {
        window.location.href = 'index.html';
    }
});

// Ajouter un écouteur pour le formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', handleLogin);

// Vérifier périodiquement la validité du token (toutes les minutes)
setInterval(() => {
    if (!isTokenValid() && window.location.pathname !== '/login.html') {
        // Rediriger vers la page de connexion si le token est expiré
        window.location.href = 'login.html';
    }
}, 60000); // Vérification toutes les minutes