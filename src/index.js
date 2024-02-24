import axios from 'axios';
import Notiflix from 'notiflix';

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

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

function clearGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';
}

function hideLoadMoreButton() {
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.display = 'none';
}

function showLoadMoreButton() {
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.display = 'block';
}

const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const searchInput = document.querySelector('[name="searchQuery"]');
  const query = searchInput.value.trim();

  if (query) {
    try {
      const data = await searchImages(query);
      if (data.hits.length === 0) {
        Notiflix.Notify.info('No images found. Please try a different search term.');
        return;
      } else {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
      currentPage = 1;
      renderImages(data.hits);
      showLoadMoreButton();
      if (data.totalHits <= currentPage * 40) {
        hideLoadMoreButton();
      }
    } catch (error) {
      Notiflix.Notify.failure('Error while searching for images. Please try again.');
    }
  }
});

const searchInput = document.querySelector('[name="searchQuery"]');
searchInput.addEventListener('input', () => {
  currentPage = 1;
  clearGallery();
});

const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.addEventListener('click', async () => {
  const searchInput = document.querySelector('[name="searchQuery"]');
  const query = searchInput.value.trim();
  try {
    await loadMoreImages(query);
  } catch (error) {
    Notiflix.Notify.failure('Error while loading more images. Please try again.');
  }
});

function renderImages(images) {
  const gallery = document.querySelector('.gallery');
  images.forEach(image => {
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('photo-card');
    
    const imgLink = document.createElement('a');
    imgLink.href = image.largeImageURL;
    imgLink.setAttribute('data-lightbox', 'gallery');

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';
    img.style.maxWidth = '100%';

    imgLink.appendChild(img);
    imgContainer.appendChild(imgLink);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info');

    const likesInfo = document.createElement('p');
    likesInfo.classList.add('info-item');
    likesInfo.innerHTML = `<b>Likes:</b> ${image.likes}`;
    
    const viewsInfo = document.createElement('p');
    viewsInfo.classList.add('info-item');
    viewsInfo.innerHTML = `<b>Views:</b> ${image.views}`;
    
    const commentsInfo = document.createElement('p');
    commentsInfo.classList.add('info-item');
    commentsInfo.innerHTML = `<b>Comments:</b> ${image.comments}`;
    
    const downloadsInfo = document.createElement('p');
    downloadsInfo.classList.add('info-item');
    downloadsInfo.innerHTML = `<b>Downloads:</b> ${image.downloads}`;
    
    infoContainer.appendChild(likesInfo);
    infoContainer.appendChild(viewsInfo);
    infoContainer.appendChild(commentsInfo);
    infoContainer.appendChild(downloadsInfo);

    imgContainer.appendChild(infoContainer);
    
    gallery.appendChild(imgContainer);
  });

  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}