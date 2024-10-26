function displayMovies(movies) {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = ''; // Clear previous content

    if (movies.length === 0) {
        movieGrid.innerHTML = '<p>No trending movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'placeholder.jpg';
        const posterElement = document.createElement('img');
        posterElement.src = posterPath;
        posterElement.classList.add('poster');
        posterElement.alt = movie.title;

        posterElement.addEventListener('click', () => {
            openModal(movie.title, `https://player.vidsrc.nl/embed/movie/${movie.id}`);
        });

        movieGrid.appendChild(posterElement);
    });
}

function displayTVShows(tvShows) {
    const tvGrid = document.getElementById('tvGrid');
    tvGrid.innerHTML = ''; // Clear previous content

    if (tvShows.length === 0) {
        tvGrid.innerHTML = '<p>No trending TV shows found.</p>';
        return;
    }

    tvShows.forEach(async (tv) => {
        const posterPath = tv.poster_path ? `${IMAGE_BASE_URL}${tv.poster_path}` : 'placeholder.jpg';
        const posterElement = document.createElement('img');
        posterElement.src = posterPath;
        posterElement.classList.add('poster');
        posterElement.alt = tv.name;

        posterElement.addEventListener('click', async () => {
            // Fetch the seasons and episodes
            const seasonData = await fetch(`${BASE_URL}/tv/${tv.id}?api_key=${API_KEY}`);
            if (!seasonData.ok) {
                console.error('Failed to fetch season details');
                return;
            }

            const seasonDetails = await seasonData.json();

            // Build the episode list for the first season
            const seasonNumber = seasonDetails.seasons[0]?.season_number || 1;
            const episodeList = await fetch(`${BASE_URL}/tv/${tv.id}/season/${seasonNumber}?api_key=${API_KEY}`);
            if (!episodeList.ok) {
                console.error('Failed to fetch episode list');
                return;
            }

            const episodes = await episodeList.json();

            openTVModal(tv.name, episodes.episodes, tv.id, seasonNumber);
        });

        tvGrid.appendChild(posterElement);
    });
}
