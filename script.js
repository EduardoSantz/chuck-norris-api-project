let currentJoke = null;

// Elementos DOM
const elements = {
    jokeContainer: document.getElementById('joke-container'),
    chuckImage: document.getElementById('chuck-image'),
    favoritesList: document.getElementById('favorites-list'),
    favoriteTemplate: document.getElementById('favorite-template')
};

const API_BASE_URL = 'http://localhost:3000'; // URL do backend

// Event Listeners
document.getElementById('new-joke-btn').addEventListener('click', getNewJoke);
document.getElementById('favorite-btn').addEventListener('click', addToFavorites);

// Busca nova piada
function getNewJoke() {
    fetch('https://api.chucknorris.io/jokes/random')
        .then(response => response.json())
        .then(data => {
            currentJoke = {
                id: data.id,
                text: data.value,
                image: data.icon_url
            };
            
            elements.jokeContainer.textContent = data.value;
            elements.chuckImage.src = data.icon_url;
        })
        .catch(error => {
            console.error('Erro:', error);
            elements.jokeContainer.textContent = 'Chuck Norris quebrou o servidor... Tente novamente!';
        });
}

// Adiciona aos favoritos (via backend)
function addToFavorites() {
    if (!currentJoke) return;

    fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentJoke)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao adicionar favorito');
        }
        return response.json();
    })
    .then(data => {
        loadFavorites();
    })
    .catch(error => {
        console.error(error);
    });
}

// Remove favoritos (via backend)
function deleteFavorite(id) {
    fetch(`${API_BASE_URL}/favorites/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao remover favorito');
        }
        return response.json();
    })
    .then(data => {
        loadFavorites();
    })
    .catch(error => {
        console.error(error);
    });
}

// Carrega favoritos (via backend)
function loadFavorites() {
    fetch(`${API_BASE_URL}/favorites`)
    .then(response => response.json())
    .then(favorites => {
        elements.favoritesList.innerHTML = '';

        if (favorites.length === 0) {
            elements.favoritesList.innerHTML = '<p>Nenhum favorito salvo ainda!</p>';
            return;
        }

        favorites.forEach(fav => {
            const clone = elements.favoriteTemplate.content.cloneNode(true);
            const item = clone.querySelector('.favorite-item');
            
            item.querySelector('.favorite-img').src = fav.image;
            item.querySelector('.favorite-text').textContent = fav.text;
            item.querySelector('.delete-btn').addEventListener('click', () => deleteFavorite(fav.id));
            
            elements.favoritesList.appendChild(clone);
        });
    })
    .catch(error => {
        console.error(error);
    });
}0

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    getNewJoke();
    loadFavorites();
});