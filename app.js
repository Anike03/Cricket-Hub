require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper function to read HTML files
const renderHTML = (filename, res) => {
    const filePath = path.join(__dirname, 'views', filename);
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            res.status(500).send('Error loading page');
        } else {
            res.send(content);
        }
    });
};

// API Routes
app.get('/api/matches', async (req, res) => {
    try {
        const cricketResponse = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${process.env.CRICKET_API_KEY}`);
        const matches = cricketResponse.data.data;
        
        const matchesWithWeather = await Promise.all(matches.map(async match => {
            try {
                const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${match.venue}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
                return {
                    ...match,
                    weather: weatherResponse.data
                };
            } catch (error) {
                return {
                    ...match,
                    weather: null
                };
            }
        }));
        
        res.json(matchesWithWeather);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching match data' });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        const newsResponse = await axios.get(
            `https://newsapi.org/v2/everything?q=cricket&apiKey=${process.env.NEWS_API_KEY}&language=en`
        );
        
        // Filter to only include articles with "cricket" in title or description
        const articles = newsResponse.data.articles
            .filter(article => 
                article.title && article.description &&
                (article.title.toLowerCase().includes('cricket') || 
                 article.description.toLowerCase().includes('cricket'))
            )
            .slice(0, 10);
            
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching news' });
    }
});

app.get('/api/players', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.cricapi.com/v1/players?apikey=${process.env.CRICKET_API_KEY}&offset=0`
        );
        
        // Filter and sort players - Indian players first
        const players = response.data.data
            .filter(player => player.country === 'India')
            .concat(
                response.data.data
                    .filter(player => player.country !== 'India')
                    .sort((a, b) => a.name.localeCompare(b.name))
            );
            
        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching player data' });
    }
});

app.get('/api/player/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://api.cricapi.com/v1/players_info?apikey=${process.env.CRICKET_API_KEY}&id=${req.params.id}`);
        const player = response.data.data;
        res.json(player);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching player details' });
    }
});

// Page Routes
app.get('/', (req, res) => {
    renderHTML('index.html', res);
});

app.get('/matches', (req, res) => {
    renderHTML('matches.html', res);
});

app.get('/news', (req, res) => {
    renderHTML('news.html', res);
});

app.get('/players', (req, res) => {
    renderHTML('players.html', res);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});