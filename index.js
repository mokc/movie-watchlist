import { API_KEY } from "./config.js"


const backgroundContainer = document.getElementById('background-container')
const results = document.getElementById('results')

const page = window.location.pathname

results.addEventListener('click', (e) => {
    if (e.target.className === 'add-remove-btn') {
        // Retrieve watchlist from localstorage if it exists
        let watchlist = localStorage.getItem('watchlist')
        watchlist = !watchlist ? [] : JSON.parse(watchlist)

        if (page === '/index.html') {               // Add movie to watchlist
            // Push item into list and update localstorage
            watchlist.push(JSON.parse(e.target.dataset.movieData))
            localStorage.setItem('watchlist', JSON.stringify(watchlist))

        } else if (page === '/watchlist.html') {    // Remove movie from watchlist
            removeMovie(e.target.dataset.movieData, watchlist)
        }
    }
})

// Separate listeners/renderings that are only on certain pages
if (page === '/index.html') {
    const searchForm = document.getElementById('search-form')

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const resp = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${document.getElementById('search-input').value}`)
        const data = await resp.json()

        if (data.Response === 'False') {
            renderNotFound()
            return
        }

        let movies = data.Search
        const movieData = await fetchMovieData(movies)

        renderResults(movieData)
    })

} else if (page === '/watchlist.html') {
    let watchlist = localStorage.getItem('watchlist')
    if (watchlist) {
        watchlist = JSON.parse(watchlist)
    }

    renderResults(watchlist)
}

function renderNotFound() {
    results.innerHTML = ''
    backgroundContainer.style.display = 'block'
    backgroundContainer.innerHTML = `
        <p class="background-text">
            Unable to find what you're looking for. Please try another search.
        </p>
    `
}

async function fetchMovieData(movies) {
    const movieData = []
    for (let movie of movies) {
        const resp = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&t=${movie.Title}`)
        const data = await resp.json()
        movieData.push(data)
    }

    return movieData
}

function renderResults(movieData) {
    let resultsHtml = ''
    for (let movie of movieData) {
        resultsHtml += buildMovieCard(movie)
    }

    backgroundContainer.style.display = 'none'
    results.innerHTML = resultsHtml

    return resultsHtml
}

function buildMovieCard(movie) {
    let iconHtml
    if (page === '/index.html') {
        iconHtml = '<i class="fa-solid fa-circle-plus"></i>'
    } else if (page === '/watchlist.html') {
        iconHtml = '<i class="fa-solid fa-circle-minus"></i>'
    } else {
        return ''
    }

    return `
        <div class="movie-card">
            <img src="${movie.Poster}" class="poster" alt="Movie poster.">
            <div>
                <div class="movie-data-line-1">
                    <h2>${movie.Title}</h2>
                    <div class="rating">
                        <i class="fa-solid fa-star"></i>
                        <h3>${movie.imdbRating}</h3>
                    </div>
                </div>
                <div class="movie-data-line-2">
                    <h3>${movie.Runtime}</h3>
                    <h3>${movie.Genre}</h3>
                    <button class="add-remove-btn" data-movie-data='${JSON.stringify(movie)}'>
                        ${iconHtml}
                        Watchlist
                    </button>
                </div>
                <p class="about-movie">${movie.Plot}</p>
            </div>
        </div>
    `
}

function removeMovie(movieData, watchlist) {
    const movieIdx = watchlist.indexOf(movieData)
    watchlist.splice(movieIdx, 1)
    localStorage.setItem('watchlist', JSON.stringify(watchlist))

    const resultsHtml = renderResults(watchlist)
    if (resultsHtml === '') {
        backgroundContainer.style.display = 'flex'
    }
    
}
