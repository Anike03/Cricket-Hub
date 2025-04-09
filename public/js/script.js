document.addEventListener('DOMContentLoaded', async function() {
    const path = window.location.pathname;
    
    if (path === '/matches' || path === '/') {
        await loadMatches(path === '/' ? 'home-matches-container' : 'matches-container');
    }
    
    if (path === '/news' || path === '/') {
        await loadNews(path === '/' ? 'home-news-container' : 'news-container');
    }
    
    if (path === '/players') {
        await loadPlayers();
        setupPlayerSearch();
    }
});

async function loadMatches(containerId) {
    try {
        const response = await fetch('/api/matches');
        const matches = await response.json();
        
        const matchesContainer = document.getElementById(containerId);
        if (matchesContainer) {
            matchesContainer.innerHTML = '';
            
            if (matches.length === 0) {
                matchesContainer.innerHTML = '<p>No matches currently available.</p>';
                return;
            }
            
            matches.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                
                const teams = match.name.split(' vs ');
                const team1 = teams[0] || 'Team 1';
                const team2 = teams[1] || 'Team 2';
                
                matchCard.innerHTML = `
                    <div class="teams">
                        <span class="team">${team1}</span>
                        <span class="vs">vs</span>
                        <span class="team">${team2}</span>
                    </div>
                    <div class="match-status">${match.status}</div>
                    <div class="match-details">
                        <p><strong>Venue:</strong> ${match.venue}</p>
                        <p><strong>Date:</strong> ${new Date(match.date).toLocaleString()}</p>
                    </div>
                    ${match.weather ? `
                    <div class="weather-info">
                        <h4>Weather at Venue</h4>
                        <p><strong>Condition:</strong> ${match.weather.weather[0].description}</p>
                        <p><strong>Temperature:</strong> ${match.weather.main.temp}°C</p>
                        <p><strong>Humidity:</strong> ${match.weather.main.humidity}%</p>
                    </div>
                    ` : '<p class="weather-unavailable">Weather data unavailable</p>'}
                `;
                
                matchesContainer.appendChild(matchCard);
            });
        }
    } catch (error) {
        console.error('Error loading matches:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p>Error loading match data. Please try again later.</p>';
        }
    }
}

async function loadNews(containerId) {
    try {
        const response = await fetch('/api/news');
        const news = await response.json();
        
        const newsContainer = document.getElementById(containerId);
        if (newsContainer) {
            newsContainer.innerHTML = '';
            
            if (news.length === 0) {
                newsContainer.innerHTML = '<p>No cricket news currently available.</p>';
                return;
            }
            
            news.forEach(article => {
                const articleCard = document.createElement('div');
                articleCard.className = 'news-card';
                
                articleCard.innerHTML = `
                    <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                    ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="news-image">` : ''}
                    <p class="news-description">${article.description || 'No description available'}</p>
                    <div class="news-meta">
                        <span class="source">${article.source?.name || 'Unknown source'}</span>
                        <span class="date">${new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                `;
                
                newsContainer.appendChild(articleCard);
            });
        }
    } catch (error) {
        console.error('Error loading news:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p>Error loading news. Please try again later.</p>';
        }
    }
}

async function loadPlayers() {
    try {
        const response = await fetch('/api/players');
        const players = await response.json();
        
        const playersContainer = document.getElementById('players-container');
        if (playersContainer) {
            playersContainer.innerHTML = '';
            
            if (!players || players.length === 0) {
                playersContainer.innerHTML = '<p>No player data currently available.</p>';
                return;
            }
            
            // Add Indian players section
            const indianPlayers = players.filter(player => player.country === 'India');
            if (indianPlayers.length > 0) {
                const indianHeader = document.createElement('h2');
                indianHeader.textContent = 'Indian Players';
                indianHeader.className = 'players-section-header';
                playersContainer.appendChild(indianHeader);
                
                const indianGrid = document.createElement('div');
                indianGrid.className = 'players-grid indian-players';
                playersContainer.appendChild(indianGrid);
                
                indianPlayers.forEach(player => {
                    createPlayerCard(player, indianGrid);
                });
            }
            
            // Add other players section
            const otherPlayers = players.filter(player => player.country !== 'India');
            if (otherPlayers.length > 0) {
                const otherHeader = document.createElement('h2');
                otherHeader.textContent = 'International Players';
                otherHeader.className = 'players-section-header';
                playersContainer.appendChild(otherHeader);
                
                const otherGrid = document.createElement('div');
                otherGrid.className = 'players-grid other-players';
                playersContainer.appendChild(otherGrid);
                
                otherPlayers.forEach(player => {
                    createPlayerCard(player, otherGrid);
                });
            }
        }
    } catch (error) {
        console.error('Error loading players:', error);
        const container = document.getElementById('players-container');
        if (container) {
            container.innerHTML = '<p>Error loading player data. Please try again later.</p>';
        }
    }
}

function createPlayerCard(player, container) {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    playerCard.setAttribute('data-country', player.country);
    playerCard.setAttribute('data-name', player.name.toLowerCase());
    
    playerCard.innerHTML = `
        <div class="player-header">
            <h3>${player.name}</h3>
            <p class="country">${player.country}</p>
        </div>
        <div class="player-details">
            <p><strong>Role:</strong> ${player.role || 'N/A'}</p>
            <p><strong>Batting Style:</strong> ${player.battingStyle || 'N/A'}</p>
            <p><strong>Bowling Style:</strong> ${player.bowlingStyle || 'N/A'}</p>
        </div>
        <a href="#" class="view-stats" data-id="${player.id}">View Detailed Stats</a>
    `;
    
    container.appendChild(playerCard);
    
    // Add event listener to view stats button
    playerCard.querySelector('.view-stats').addEventListener('click', async (e) => {
        e.preventDefault();
        const playerId = e.target.getAttribute('data-id');
        await showPlayerStats(playerId);
    });
}

function setupPlayerSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('player-search');
    const playerCards = document.querySelectorAll('.player-card');
    
    if (!searchBtn || !searchInput) return;
    
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        playerCards.forEach(card => {
            const playerName = card.getAttribute('data-name');
            if (searchTerm === '' || playerName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Hide empty sections
        document.querySelectorAll('.players-grid').forEach(grid => {
            const visibleCards = grid.querySelectorAll('.player-card[style="display: block"]');
            if (visibleCards.length === 0) {
                grid.previousElementSibling.style.display = 'none';
                grid.style.display = 'none';
            } else {
                grid.previousElementSibling.style.display = 'block';
                grid.style.display = 'grid';
            }
        });
    };
    
    // Search on button click
    searchBtn.addEventListener('click', performSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Search as you type (with slight delay)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });
    
    // Clear search and show all when X is clicked (if browser adds clear button)
    searchInput.addEventListener('search', performSearch);
}

async function showPlayerStats(playerId) {
    try {
        const response = await fetch(`/api/player/${playerId}`);
        const stats = await response.json();
        
        // Create a modal to display stats
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>${stats.name}</h2>
                <div class="player-info">
                    <p><strong>Country:</strong> ${stats.country}</p>
                    <p><strong>Role:</strong> ${stats.role || 'N/A'}</p>
                </div>
                <div class="stats-grid">
                    <div class="batting-stats">
                        <h3>Batting Statistics</h3>
                        <p><strong>Matches:</strong> ${stats.batting?.matches || 'N/A'}</p>
                        <p><strong>Runs:</strong> ${stats.batting?.runs || 'N/A'}</p>
                        <p><strong>Average:</strong> ${stats.batting?.average || 'N/A'}</p>
                        <p><strong>Strike Rate:</strong> ${stats.batting?.strikeRate || 'N/A'}</p>
                        <p><strong>50s:</strong> ${stats.batting?.fifties || 'N/A'}</p>
                        <p><strong>100s:</strong> ${stats.batting?.hundreds || 'N/A'}</p>
                    </div>
                    <div class="bowling-stats">
                        <h3>Bowling Statistics</h3>
                        <p><strong>Matches:</strong> ${stats.bowling?.matches || 'N/A'}</p>
                        <p><strong>Wickets:</strong> ${stats.bowling?.wickets || 'N/A'}</p>
                        <p><strong>Average:</strong> ${stats.bowling?.average || 'N/A'}</p>
                        <p><strong>Economy:</strong> ${stats.bowling?.economy || 'N/A'}</p>
                        <p><strong>Best Bowling:</strong> ${stats.bowling?.bestBowling || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when X is clicked
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    } catch (error) {
        console.error('Error loading player stats:', error);
        alert('Error loading player statistics. Please try again later.');
    }
}