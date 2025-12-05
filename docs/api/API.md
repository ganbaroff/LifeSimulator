# 🔌 Life Simulator Azerbaijan API Documentation

**RESTful API for Life Simulator Azerbaijan game services**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [SDKs](#sdks)

---

## 🎯 Overview

The Life Simulator Azerbaijan API provides endpoints for game data, user management, analytics, and more. This API follows RESTful conventions and uses JSON for data exchange.

### 🔐 Authentication

All API requests require authentication using JWT tokens:

```http
Authorization: Bearer <your-jwt-token>
```

### 🌐 Base URLs

| Environment | URL |
|-------------|-----|
| Development | `https://api-dev.lifesimulator.az` |
| Staging | `https://api-staging.lifesimulator.az` |
| Production | `https://api.lifesimulator.az` |

---

## 🛡️ Authentication

### 🔑 JWT Token Generation

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 86400,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 🔄 Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

---

## 📊 Endpoints

### 👤 User Management

#### Get User Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "profile": {
      "username": "player123",
      "avatar": "https://cdn.example.com/avatars/user_123.jpg",
      "level": 5,
      "experience": 2500,
      "totalPlayTime": 3600,
      "achievements": ["first_character", "survivor"]
    },
    "statistics": {
      "charactersCreated": 12,
      "totalPlayTime": 86400,
      "favoriteCity": "baku",
      "preferredDifficulty": "medium"
    }
  }
}
```

#### Update User Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "avatar": "new_avatar_url"
}
```

### 🎮 Game Data

#### Get Cities

```http
GET /game/cities
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "baku",
      "name": "Baku",
      "description": "Capital city of Azerbaijan, known for oil industry and modern architecture",
      "population": 2300000,
      "region": "absheron",
      "bonuses": {
        "health": 5,
        "happiness": 10,
        "energy": 0,
        "wealth": 15
      },
      "historicalSignificance": ["oil_boom", "independence", "modern_era"]
    }
  ]
}
```

#### Get Historical Events

```http
GET /game/events?year=1920&city=baku
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "oil_boom_1920",
        "year": 1920,
        "title": "Oil Boom Begins",
        "description": "The oil industry in Baku experiences rapid growth",
        "type": "economic",
        "impact": "positive",
        "affectedCities": ["baku", "sumgait"],
        "choices": [
          {
            "id": "work_in_oil",
            "text": "Work in oil industry",
            "effects": {
              "health": -5,
              "happiness": 10,
              "energy": -10,
              "wealth": 20
            }
          }
        ]
      }
    ],
    "totalCount": 1,
    "hasMore": false
  }
}
```

### 📱 Characters

#### Create Character

```http
POST /characters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ali",
  "birthYear": 1990,
  "birthCity": "baku",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "character": {
      "id": "char_123",
      "name": "Ali",
      "birthYear": 1990,
      "birthCity": "baku",
      "currentAge": 34,
      "stats": {
        "health": 100,
        "happiness": 100,
        "energy": 100,
        "wealth": 1000
      },
      "isAlive": true,
      "history": [],
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "gameSession": {
      "id": "session_123",
      "characterId": "char_123",
      "currentYear": 1990,
      "isPlaying": true
    }
  }
}
```

#### Get Character

```http
GET /characters/{characterId}
Authorization: Bearer <token>
```

#### Update Character Stats

```http
PUT /characters/{characterId}/stats
Authorization: Bearer <token>
Content-Type: application/json

{
  "health": 95,
  "happiness": 105,
  "energy": 90,
  "wealth": 1100
}
```

#### Process Choice

```http
POST /characters/{characterId}/choices
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "oil_boom_1920",
  "choiceId": "work_in_oil",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "effects": {
      "health": -5,
      "happiness": 10,
      "energy": -10,
      "wealth": 20
    },
    "newStats": {
      "health": 95,
      "happiness": 110,
      "energy": 90,
      "wealth": 1020
    },
    "nextEvent": {
      "id": "next_event_123",
      "year": 1991,
      "title": "Soviet Collapse",
      "description": "The Soviet Union collapses, Azerbaijan gains independence"
    },
    "gameHistory": {
      "id": "history_123",
      "eventId": "oil_boom_1920",
      "choiceId": "work_in_oil",
      "year": 1990,
      "effects": {
        "health": -5,
        "happiness": 10,
        "energy": -10,
        "wealth": 20
      }
    }
  }
}
```

### 📈 Analytics

#### Track Event

```http
POST /analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "event": "character_created",
  "properties": {
    "difficulty": "medium",
    "birthCity": "baku",
    "birthYear": 1990
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "sessionId": "session_123"
}
```

#### Get Analytics Dashboard

```http
GET /analytics/dashboard?period=7d&metrics=dau,retention,completion
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "metrics": {
      "dau": {
        "current": 1500,
        "previous": 1200,
        "change": "+25%"
      },
      "retention": {
        "day1": 0.85,
        "day7": 0.65,
        "day30": 0.45
      },
      "completion": {
        "characterCreation": 0.92,
        "firstEvent": 0.88,
        "gameCompletion": 0.35
      }
    },
    "funnels": [
      {
        "name": "Character Creation",
        "steps": [
          { "step": "started", "count": 1000, "conversion": 1.0 },
          { "step": "completed", "count": 920, "conversion": 0.92 }
        ]
      }
    ]
  }
}
```

### 🏆 Achievements

#### Get Achievements

```http
GET /achievements
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "first_character",
      "name": "First Steps",
      "description": "Create your first character",
      "icon": "👶",
      "category": "beginner",
      "points": 10,
      "unlockedAt": "2024-01-01T12:00:00Z",
      "progress": {
        "current": 1,
        "required": 1,
        "completed": true
      }
    }
  ]
}
```

#### Unlock Achievement

```http
POST /achievements/{achievementId}/unlock
Authorization: Bearer <token>
```

### 📊 Leaderboards

#### Get Leaderboards

```http
GET /leaderboards?type=wealth&period=weekly&limit=100
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "wealth",
    "period": "weekly",
    "entries": [
      {
        "rank": 1,
        "user": {
          "id": "user_123",
          "username": "player123",
          "avatar": "https://cdn.example.com/avatars/user_123.jpg"
        },
        "character": {
          "id": "char_123",
          "name": "Ali",
          "finalWealth": 50000
        },
        "score": 50000,
        "achievedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "userRank": 25,
    "totalEntries": 1000
  }
}
```

---

## 📋 Data Models

### 👤 User

```typescript
interface User {
  id: string;
  email: string;
  profile: {
    username: string;
    avatar?: string;
    level: number;
    experience: number;
    totalPlayTime: number;
    achievements: string[];
  };
  statistics: {
    charactersCreated: number;
    totalPlayTime: number;
    favoriteCity: string;
    preferredDifficulty: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 🎮 Character

```typescript
interface Character {
  id: string;
  name: string;
  birthYear: number;
  birthCity: string;
  currentAge: number;
  stats: {
    health: number;
    happiness: number;
    energy: number;
    wealth: number;
  };
  isAlive: boolean;
  history: GameHistory[];
  createdAt: string;
  updatedAt: string;
}
```

### 📅 Historical Event

```typescript
interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  type: 'political' | 'economic' | 'social' | 'cultural' | 'military' | 'migration' | 'infrastructure';
  impact: 'positive' | 'negative' | 'neutral' | 'mixed';
  affectedCities: string[];
  choices: Choice[];
}
```

### 🎯 Choice

```typescript
interface Choice {
  id: string;
  text: string;
  effects: {
    health: number;
    happiness: number;
    energy: number;
    wealth: number;
  };
}
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "CHARACTER_NOT_FOUND",
    "message": "Character not found",
    "details": {
      "characterId": "char_123"
    },
    "timestamp": "2024-01-01T12:00:00Z",
    "requestId": "req_123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 🚦 Rate Limiting

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Game Data | 100 requests | 15 minutes |
| Character Actions | 50 requests | 15 minutes |
| Analytics | 200 requests | 15 minutes |
| Other | 100 requests | 15 minutes |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📚 SDKs

### JavaScript/TypeScript

```bash
npm install lifesimulator-azerbaijan-sdk
```

```typescript
import { LifeSimulatorAPI } from 'lifesimulator-azerbaijan-sdk';

const api = new LifeSimulatorAPI({
  baseURL: 'https://api.lifesimulator.az',
  token: 'your-jwt-token'
});

// Create character
const character = await api.characters.create({
  name: 'Ali',
  birthYear: 1990,
  birthCity: 'baku',
  difficulty: 'medium'
});
```

### React Native

```bash
npm install lifesimulator-react-native-sdk
```

```typescript
import { LifeSimulatorProvider, useLifeSimulator } from 'lifesimulator-react-native-sdk';

function App() {
  return (
    <LifeSimulatorProvider token="your-jwt-token">
      <GameComponent />
    </LifeSimulatorProvider>
  );
}

function GameComponent() {
  const { characters, events } = useLifeSimulator();
  
  const createCharacter = async () => {
    const character = await characters.create({
      name: 'Ali',
      birthYear: 1990,
      birthCity: 'baku',
      difficulty: 'medium'
    });
  };
  
  return <YourGameUI />;
}
```

---

## 🔧 Development

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lifesimulator-api.git
   cd lifesimulator-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

### API Documentation

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/api-docs.json`

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

---

## 📞 Support

### 🆘 Getting Help

- **Documentation**: Check [API docs](https://docs.lifesimulator.az/api)
- **Issues**: [GitHub Issues](https://github.com/your-username/lifesimulator-api/issues)
- **Email**: api-support@lifesimulator.az
- **Discord**: Join our Discord server

### 🐛 Bug Reports

When reporting API issues, include:

- **Request Details**: Method, URL, headers, body
- **Response Details**: Status code, headers, body
- **Timestamp**: When the issue occurred
- **Environment**: Development/staging/production

---

**🔌 Life Simulator Azerbaijan API © 2024**

*Version: 1.0.0*
