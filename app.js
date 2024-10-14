const API_KEY = '5cfb2e9e20ae09fcd4f2d57501bc6238';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Get other elements
const mediaModal = document.getElementById('mediaModal');
const videoModal = document.getElementById('videoModal');
const closeModal = document.querySelectorAll('.close');
const mediaDetails = document.getElementById('mediaDetails');
const episodeMenu = document.getElementById('episodeMenu');
const playButton = document.getElementById('playButton');
const videoPlayer = document.getElementById('videoPlayer');
const searchBar = document.getElementById('searchBar');

// Close modals when the close button is clicked
closeModal.forEach(button => {
    button.onclick = function() {
        mediaModal.style.display = 'none';
        videoModal.style.display = 'none';
        videoPlayer.src = ''; // Stop the video
    };
});

// Close the modal when clicking outside the modal content
window.onclick = function(event) {
    if (event.target === mediaModal || event.target === videoModal) {
        mediaModal.style.display = 'none';
        videoModal.style.display = 'none';
        videoPlayer.src = ''; // Stop the video
    }
};

// Fetch trending movies
async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Fetch trending TV shows
async function fetchTrendingTVShows() {
    try {
        const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
        const data = await response.json();
        displayTVShows(data.results);
    } catch (error) {
        console.error('Error fetching TV shows:', error);
    }
}

// Search for movies and TV shows
async function searchMoviesAndShows(query) {
    try {
        const [moviesResponse, tvResponse] = await Promise.all([
            fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`),
            fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
        ]);
        
        const moviesData = await moviesResponse.json();
        const tvData = await tvResponse.json();
        
        displayMovies(moviesData.results);
        displayTVShows(tvData.results);
    } catch (error) {
        console.error('Error searching for movies and TV shows:', error);
    }
}

// Display movies in the movie grid
function displayMovies(movies) {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = ''; // Clear previous content

    movies.forEach(movie => {
        const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'placeholder.jpg';
        const posterElement = document.createElement('img');
        posterElement.src = posterPath;
        posterElement.classList.add('poster');
        posterElement.alt = movie.title;

        // Add click event to poster element
        posterElement.addEventListener('click', () => {
            showMediaModal(movie.id, 'movie', movie.title, posterPath);
        });

        movieGrid.appendChild(posterElement);
    });
}

// Display TV shows in the TV show grid
function displayTVShows(tvShows) {
    const tvGrid = document.getElementById('tvGrid');
    tvGrid.innerHTML = ''; // Clear previous content

    tvShows.forEach(tv => {
        const posterPath = tv.poster_path ? `${IMAGE_BASE_URL}${tv.poster_path}` : 'placeholder.jpg';
        const posterElement = document.createElement('img');
        posterElement.src = posterPath;
        posterElement.classList.add('poster');
        posterElement.alt = tv.name;

        // Add click event to poster element
        posterElement.addEventListener('click', () => {
            showMediaModal(tv.id, 'tv', tv.name, posterPath);
        });

        tvGrid.appendChild(posterElement);
    });
}

// Show media modal
function showMediaModal(mediaId, mediaType, mediaTitle = '', posterPath = '') {
    mediaDetails.innerHTML = mediaTitle ? `<h3>${mediaTitle}</h3>` : '';
    if (mediaType === 'tv') {
        fetchTVShowSeasons(mediaId);  // Fetch seasons and episodes for TV shows
    } else if (mediaType === 'movie') {
        playButton.onclick = () => {
            videoPlayer.src = `https://player.vidsrc.nl/embed/movie/${mediaId}`;
            videoModal.style.display = 'block'; // Show video modal
            addToRecentlyWatched({ id: mediaId, type: 'movie', title: mediaTitle, poster: posterPath });
        };
    }
    mediaModal.style.display = 'block'; // Show media modal
}

// Fetch TV show seasons
async function fetchTVShowSeasons(tvId) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
        const data = await response.json();
        displayTVShowSeasons(data);
    } catch (error) {
        console.error('Error fetching TV show seasons:', error);
    }
}

// Fetch episodes of a season
async function fetchTVShowEpisodes(tvId, seasonNumber) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
        const data = await response.json();
        displayTVShowEpisodes(tvId, seasonNumber, data);
    } catch (error) {
        console.error('Error fetching TV show episodes:', error);
    }
}

// Display TV show seasons in the episode menu
function displayTVShowSeasons(tvShow) {
    const { name, seasons } = tvShow;
    mediaDetails.innerHTML = `<h3>${name}</h3>`;
    let seasonsHtml = '<h4>Seasons:</h4><ul>';

    seasons.forEach(season => {
        seasonsHtml += `<li><button onclick="fetchTVShowEpisodes(${tvShow.id}, ${season.season_number})">Season ${season.season_number}</button></li>`;
    });
    seasonsHtml += '</ul>';
    episodeMenu.innerHTML = seasonsHtml; // Add the seasons to the episode menu
}

// Display TV show episodes in the episode menu
function displayTVShowEpisodes(tvId, seasonNumber, season) {
    const { episodes, name } = season;
    let episodesHtml = `<h4>Episodes of ${name} - Season ${seasonNumber}:</h4><ul>`;
    
    episodes.forEach(episode => {
        episodesHtml += `<li><strong>Episode ${episode.episode_number}:</strong> ${episode.name} <button onclick="playEpisode(${tvId}, ${seasonNumber}, ${episode.episode_number}, '${episode.name}')">Play</button></li>`;
    });
    episodesHtml += '</ul>';
    episodeMenu.innerHTML = episodesHtml; // Replace seasons with episodes in the episode menu
}

// Play episode
function playEpisode(tvId, seasonNumber, episodeNumber, episodeName) {
    videoPlayer.src = `https://player.vidsrc.nl/embed/tv/${tvId}/${seasonNumber}/${episodeNumber}`;
    videoModal.style.display = 'block'; // Show video modal

    const episodeTitle = `S${seasonNumber}E${episodeNumber} - ${episodeName}`; // Create a short episode title
    addToRecentlyWatched({ id: tvId, type: 'tv', season: seasonNumber, episode: episodeNumber, title: episodeTitle, poster: 'episodePoster.jpg' });
}

// Add to Recently Watched List
function addToRecentlyWatched(media) {
    let recentlyWatched = JSON.parse(localStorage.getItem('recentlyWatched')) || [];

    // Check if the item already exists, and remove it if it does
    recentlyWatched = recentlyWatched.filter(item => !(item.id === media.id && item.type === media.type));

    // Add the new item to the front of the array
    recentlyWatched.unshift(media);

    // Limit to 10 items
    if (recentlyWatched.length > 10) {
        recentlyWatched.pop();
    }

    // Save the updated list back to localStorage
    localStorage.setItem('recentlyWatched', JSON.stringify(recentlyWatched));
}

// Display Recently Watched Media
function displayRecentlyWatched() {
    const recentlyWatched = JSON.parse(localStorage.getItem('recentlyWatched')) || [];
    const recentlyWatchedGrid = document.getElementById('recentlyWatchedGrid');
    recentlyWatchedGrid.innerHTML = ''; // Clear previous content

    recentlyWatched.forEach(item => {
        const posterElement = document.createElement('img');
        posterElement.src = item.poster || 'placeholder.jpg'; // Use a placeholder if no poster
        posterElement.classList.add('poster');
        posterElement.alt = item.title;

        // Add click event to poster element
        posterElement.addEventListener('click', () => {
            if (item.type === 'movie') {
                showMediaModal(item.id, 'movie', item.title, item.poster);
            } else if (item.type === 'tv')
