import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '42481427-12d08fa9cedf5ba58e5021062';

async function searchImages(query, page = 1) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error while fetching images:', error);
    throw error;
  }
}

let currentPage = 1;

async function loadMoreImages(query) {
  try {
    currentPage++;
    const data = await searchImages(query, currentPage);
    renderImages(data.hits);
    if (data.totalHits <= currentPage * 40) {
      hideLoadMoreButton();
    }
  } catch (error) {
    Notiflix.Notify.failure('Error while loading more images. Please try again.');
  }
}

function hideLoadMoreButton() {
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.display = 'none';
}

const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Zapobiegamy domyślnej akcji formularza (przeładowaniu strony)
  const searchInput = document.querySelector('[name="searchQuery"]');
  const query = searchInput.value.trim(); // Pobieramy wartość wpisaną przez użytkownika

  if (query) {
    try {
      const data = await searchImages(query); // Wyszukujemy obrazy dla wpisanego zapytania
      if (data.hits.length === 0) {
        Notiflix.Notify.info('No images found. Please try a different search term.');
        return; // Przerywamy dalsze wykonywanie funkcji
      }
      renderImages(data.hits); // Renderujemy znalezione obrazy
      currentPage = 1; // Resetujemy numer aktualnej strony
      const loadMoreButton = document.querySelector('.load-more');
      loadMoreButton.style.display = 'block'; // Wyświetlamy przycisk "Load more"
      if (data.totalHits <= currentPage * 40) {
        hideLoadMoreButton(); // Ukrywamy przycisk, jeśli nie ma więcej wyników do wczytania
      }
    } catch (error) {
      Notiflix.Notify.failure('Error while searching for images. Please try again.'); // Wyświetlamy powiadomienie o błędzie
    }
  }
});

// Renderowanie obrazków
function renderImages(images) {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = ''; // Czyścimy zawartość galerii przed wyrenderowaniem nowych obrazków
  images.forEach(image => {
    const img = document.createElement('img');
    img.src = image.webformatURL; // Ustawiamy źródło obrazka
    img.alt = image.tags; // Ustawiamy atrybut alt
    img.loading = 'lazy'; // Ustawiamy lazy loading
    gallery.appendChild(img); // Dodajemy obrazek do galerii
  });
}

// Obsługa przycisku "Load more"
const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.addEventListener('click', async () => {
  const searchInput = document.querySelector('[name="searchQuery"]');
  const query = searchInput.value.trim(); // Pobieramy aktualne zapytanie
  try {
    await loadMoreImages(query); // Ładujemy więcej obrazków
  } catch (error) {
    Notiflix.Notify.failure('Error while loading more images. Please try again.'); // Wyświetlamy powiadomienie o błędzie
  }
});