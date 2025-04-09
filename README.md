# Cricket-Hub
Cricket Hub API 🏏

A comprehensive REST API for cricket enthusiasts providing live scores, player statistics, and news.

🌟 Features
Real-time match data with venue weather information

Player statistics with special focus on Indian players

Cricket-exclusive news aggregation

Global player search functionality

Responsive design for all devices

🚀 Quick Start
Prerequisites
Node.js (v16+ recommended)

npm (v8+)

API keys for:

CricketAPI

NewsAPI

OpenWeatherMap

Installation
bash
Copy
# Clone the repository
git clone https://github.com/Anike03/Cricket-Hub.git
cd cricket-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
Running the Server
bash
Copy
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
The API will be available at http://localhost:3000

📡 API Endpoints
1. Match Data
Copy
GET /api/matches
Response:

json
Copy
{
  "matches": [
    {
      "id": "match-123",
      "name": "India vs Australia",
      "status": "In Progress",
      "venue": "Melbourne Cricket Ground",
      "date": "2023-12-26T08:00:00Z",
      "weather": {
        "temp": 22.5,
        "condition": "Partly Cloudy",
        "humidity": 65
      }
    }
  ]
}

2. Player Data
Copy
GET /api/players
Response:

json
Copy
{
  "indianPlayers": [
    {
      "id": "player-123",
      "name": "Virat Kohli",
      "country": "India",
      "role": "Batsman"
    }
  ],
  "otherPlayers": [
    {
      "id": "player-456",
      "name": "Steve Smith",
      "country": "Australia",
      "role": "Batsman"
    }
  ]
}

3. Player Details
Copy
GET /api/player/:id
Response:

json
Copy
{
  "id": "player-123",
  "name": "Virat Kohli",
  "country": "India",
  "stats": {
    "batting": {
      "matches": 254,
      "runs": 12169,
      "average": 59.07
    },
    "bowling": {
      "matches": 254,
      "wickets": 4,
      "average": 166.25
    }
  }
}

4. Cricket News
Copy
GET /api/news
Response:

json
Copy
[
  {
    "title": "India wins T20 World Cup",
    "source": "ESPN Cricinfo",
    "publishedAt": "2023-11-19T14:30:00Z",
    "url": "https://example.com/news/123"
  }
]
