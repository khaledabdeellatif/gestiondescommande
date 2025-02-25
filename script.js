// Définition des produits
const produits = [
    { id: 1, nom: "Bachkoto", prix: 8, image: "img/bachkoto.jpg" },
    { id: 2, nom: "Baklawa louz", prix: 45, image: "img/baklawa.jpg" },
    { id: 3, nom: "Ghrayba drouaa", prix: 50, image: "img/ghrayba.jpg" },
    { id: 4, nom: "Kaak warka", prix: 45, image: "img/kaak_warka.jpg" },
    { id: 5, nom: "varias", prix: 50, image: "img/bachkoto.jpg" },
    { id: 6, nom: "Baklawa noisette", prix: 40, image: "img/baklawa.jpg" },
    { id: 7, nom: "Ghrayba homus", prix: 20, image: "img/ghrayba.jpg" },
    { id: 8, nom: "boule de carthage", prix: 45, image: "img/bachkoto.jpg" },
    { id: 9, nom: "lobnani mkhalit", prix: 40, image: "img/baklawa.jpg" },
    { id: 10, nom: "Ghrayba bithaa", prix: 20, image: "img/ghrayba.jpg" },
    { id: 11, nom: "samsa fekia", prix: 45, image: "img/bachkoto.jpg" },
    { id: 12, nom: "samsa jeljlen", prix: 27, image: "img/baklawa.jpg" },
    { id: 13, nom: "sablets", prix: 20, image: "img/ghrayba.jpg" },
    { id: 14, nom: "lobnani pistache", prix: 40, image: "img/bachkoto.jpg" },
    { id: 15, nom: "lobnani warda", prix: 40, image: "img/baklawa.jpg" },
    { id: 16, nom: "lobnani swbaa", prix: 40, image: "img/ghrayba.jpg" },
    { id: 17, nom: "lobnani noisette", prix: 40, image: "img/kaak_warka.jpg" },
    { id: 18, nom: "baklawa turkia", prix: 20, image: "img/bachkoto.jpg" },
    { id: 19, nom: "palmier sokor", prix: 15, image: "img/baklawa.jpg" },
    { id: 20, nom: "palmier jeljlen", prix: 15, image: "img/ghrayba.jpg" },
    { id: 21, nom: "halkoum", prix: 25, image: "img/bachkoto.jpg" },
    { id: 22, nom: "twil", prix: 40, image: "img/baklawa.jpg" },
    { id: 23, nom: "Makrouth", prix: 10, image: "img/ghrayba.jpg" },
    { id: 24, nom: "youyou", prix: 10, image: "img/bachkoto.jpg" },
    { id: 25, nom: "Maalmoul", prix: 25, image: "img/baklawa.jpg" },
    { id: 26, nom: "Deblaa", prix: 25, image: "img/ghrayba.jpg" },
    { id: 27, nom: "Bjawiaa", prix: 50, image: "img/ghrayba.jpg" },
    { id: 28, nom: "kaaber louz", prix: 50, image: "img/ghrayba.jpg" },
];

// Diviser les produits en trois catégories
const categorie1 = produits.slice(0, 9);  
const categorie2 = produits.slice(9, 18);
const categorie3 = produits.slice(18);  
let produitsActuels = [...produits]; // Tous les produits par défaut

// Variables globales
let panier = [];
let categorieActive = 1;

// Sélection des éléments DOM
const produitsListe = document.getElementById("produits-liste");
const panierListe = document.getElementById("panier-liste");
const searchInput = document.getElementById("searchProduits");
const totalAmount = document.getElementById("total-amount");
const nomClient = document.getElementById("nomClient");
const telClient = document.getElementById("telClient");
const accountClient = document.getElementById("accountClient");
const noteCommande = document.getElementById("noteCommande");
const commanderBtn = document.querySelector(".btn.commander");
// Fonction pour changer de catégorie
function changerCategorie(categorie) {
    categorieActive = categorie;
    switch (categorie) {
        case 1:
            afficherProduits(categorie1);
            break;
        case 2:
            afficherProduits(categorie2);
            break;
        case 3:
            afficherProduits(categorie3);
            break;
    }
}

// Fonction pour afficher les produits
function afficherProduits(produitsAfficher = categorie1) {
    produitsListe.innerHTML = "";
    produitsAfficher.forEach((produit) => {
        const div = document.createElement("div");
        div.classList.add("produit");
        div.innerHTML = `
            <img src="${produit.image}" alt="${produit.nom}">
            <h3>${produit.nom}</h3>
            <p class="price">${produit.prix.toFixed(2)} DT</p>
        `;
        div.onclick = () => ajouterAuPanier(produit);
        produitsListe.appendChild(div);
    });
}

// Fonction pour ajouter au panier
function ajouterAuPanier(produit) {
    const quantite = parseFloat(prompt(`Entrez la quantité pour ${produit.nom} :`, "1"));
    
    if (isNaN(quantite) || quantite <= 0) {
        showToast("Quantité invalide", 'error');
        return;
    }

    const existe = panier.find((item) => item.id === produit.id);
    if (existe) {
        existe.quantite += quantite;
    } else {
        panier.push({ ...produit, quantite: quantite });
    }
    afficherPanier();
    updateTotal();
    showToast(`${produit.nom} ajouté au panier`, 'success');
}

// Fonction pour afficher le panier
function afficherPanier() {
    panierListe.innerHTML = "";
    if (panier.length === 0) {
        panierListe.innerHTML = "<p class='vide'>Votre panier est vide</p>";
        return;
    }

    panier.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("panier-item");
        div.innerHTML = `
            <span>${item.nom}</span>
            <div class="quantity-controls">
                <span>${item.prix.toFixed(3)} DT</span>
                <button class="quantity-btn" onclick="modifierQuantite(${item.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <span>${item.quantite.toFixed(1)} Kg</span>
                <button class="quantity-btn" onclick="supprimerDuPanier(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        panierListe.appendChild(div);
    });
}

// Fonction pour modifier la quantité
function modifierQuantite(id) {
    const item = panier.find((prod) => prod.id === id);
    if (item) {
        const nouvelleQuantite = parseFloat(prompt(`Modifier la quantité pour ${item.nom} :`, item.quantite));
        
        if (isNaN(nouvelleQuantite) || nouvelleQuantite <= 0) {
            showToast("Quantité invalide", 'error');
            return;
        }

        item.quantite = nouvelleQuantite;
        afficherPanier();
        updateTotal();
    }
}

// Fonction pour supprimer du panier
function supprimerDuPanier(id) {
    panier = panier.filter((item) => item.id !== id);
    afficherPanier();
    updateTotal();
    showToast('Produit retiré du panier', 'error');
}

// Fonction pour vider le panier
function viderPanier() {
    panier = [];
    afficherPanier();
    updateTotal();
    showToast('Panier vidé', 'error');
    
    // Réinitialiser les champs du client
    nomClient.value = '';
    telClient.value = '';
    accountClient.value = '';
    noteCommande.value = '';
}

// Fonction pour mettre à jour le total
function updateTotal() {
    const total = panier.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    totalAmount.textContent = `${total.toFixed(2)} DT`;
}

// Fonction pour valider le formulaire
function validerFormulaire() {
    let erreurs = [];
    
    if (!nomClient.value.trim()) {
        erreurs.push("Le nom du client est requis");
        nomClient.classList.add('error');
    }
    
    if (!telClient.value.trim()) {
        erreurs.push("Le numéro de téléphone est requis");
        telClient.classList.add('error');
    } else if (!/^[0-9]{8}$/.test(telClient.value.trim())) {
        erreurs.push("Le numéro de téléphone doit contenir 8 chiffres");
        telClient.classList.add('error');
    }
    
    if (panier.length === 0) {
        erreurs.push("Le panier est vide");
    }
    
    return erreurs;
}

// Fonction pour afficher les notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Vérification du token
function verifierToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Gestion de la déconnexion
function deconnexion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Gestionnaire d'événement pour la commande
commanderBtn.addEventListener('click', async () => {
    const erreurs = validerFormulaire();

    if (erreurs.length > 0) {
        erreurs.forEach(erreur => showToast(erreur, 'error'));
        return;
    }

    const commande = {
        client: {
            nom: nomClient.value.trim(),
            telephone: telClient.value.trim(),
        },
        produits: panier.map(item => ({
            id: item.id,
            quantite: item.quantite
        })),
        total: parseFloat(totalAmount.textContent),
        note: noteCommande.value.trim(),
        account: accountClient.value.trim()
    };

    try {
        const response = await fetch('http://localhost:3000/commandes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(commande)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi de la commande');
        }

        const data = await response.json();
        viderPanier();
        showToast('Commande envoyée avec succès!', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de l\'envoi de la commande', 'error');
    }
});

// Fonction de recherche
searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = produits.filter(produit => 
        produit.nom.toLowerCase().includes(searchTerm)
    );
    afficherProduits(filteredProducts);
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    if (!verifierToken()) return;

    // Créer les boutons de catégorie
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'categories-container';
    categoriesContainer.innerHTML = `
        <button id="cat1-btn" class="cat-btn active" onclick="changerCategorie(1)">1</button>
        <button id="cat2-btn" class="cat-btn" onclick="changerCategorie(2)">2</button>
        <button id="cat2-btn" class="cat-btn" onclick="changerCategorie(3)">3</button>
    `;
    
    produitsListe.parentNode.insertBefore(categoriesContainer, produitsListe);
    
    // Afficher les produits initiaux
    afficherProduits(categorie1);


    // Initialiser les gestionnaires d'événements des champs
    document.querySelectorAll('input, textarea').forEach(element => {
        element.addEventListener('focus', () => {
            element.classList.remove('error');
        });
    });
});