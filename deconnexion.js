// auth.js - À placer dans un dossier js/
function logout() {
    // Supprimer le token et sa date d'expiration
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
}

// Fonction pour vérifier si l'utilisateur est connecté
function checkAuth() {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !tokenExpiry) {
        window.location.href = 'login.html';
        return false;
    }

    // Vérifier si le token a expiré
    const now = new Date().getTime();
    if (now > parseInt(tokenExpiry)) {
        logout();
        return false;
    }

    return true;
}

// Ajouter le bouton de déconnexion à toutes les pages protégées
function addLogoutButton() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Créer le conteneur pour le bouton de déconnexion
    const logoutContainer = document.createElement('div');
    logoutContainer.className = 'logout-container';
    
    // Créer le bouton de déconnexion
    const logoutButton = document.createElement('button');
    logoutButton.className = 'btn logout-btn';
    logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
    logoutButton.onclick = logout;
    
    // Ajouter le bouton au conteneur
    logoutContainer.appendChild(logoutButton);
    
    // Ajouter le conteneur au header
    header.appendChild(logoutContainer);
}

// Exécuter au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname !== '/login.html') {
        // Vérifier l'authentification
        if (checkAuth()) {
            // Ajouter le bouton de déconnexion
            addLogoutButton();
        }
    }
});