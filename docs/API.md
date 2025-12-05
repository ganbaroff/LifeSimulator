# API Documentation - Life Simulator Azerbaijan

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Analytics API](#analytics-api)
- [Game API](#game-api)
- [Character API](#character-api)
- [Security API](#security-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## 🎯 Overview

Life Simulator Azerbaijan provides a comprehensive RESTful API for game data, analytics, and security operations.

### Base URL

```
https://api.lifesimulator.az/v1
```

### API Versioning

- Current version: `v1`
- Version in URL: `/v1/`
- Backward compatibility maintained for 6 months

---

## 🔐 Authentication

### API Key Authentication

All API requests require an API key passed in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
```

### JWT Authentication (for user-specific operations)

```http
Authorization: JWT YOUR_JWT_TOKEN
```

### Getting API Keys

1. Register at [developer portal](https://dev.lifesimulator.az)
2. Create new application
3. Generate API key
4. Set appropriate permissions

---

## 📊 Analytics API

### Events Endpoint

Track user events and game actions.

```http
POST /analytics/events
```

#### Request Body

```json
{
  "event": "character_created",
  "properties": {
    "difficulty": "normal",
    "birth_city": "Baku",
    "birth_year": 1995,
    "completion_time": 120
  },
  "timestamp": 1634567890123,
  "user_id": "user_123",
  "session_id": "session_456"
}
```

#### Response

```json
{
  "success": true,
  "event_id": "evt_789",
  "processed": true
}
```

### Batch Events Endpoint

Send multiple events in one request.

```http
POST /analytics/batch
```

#### Request Body

```json
{
  "events": [
    {
      "event": "character_created",
      "properties": {...}
    },
    {
      "event": "game_started",
      "properties": {...}
    }
  ],
  "session_id": "session_456"
}
```

### User Properties Endpoint

Update user properties for segmentation.

```http
POST /analytics/users/properties
```

#### Request Body

```json
{
  "user_id": "user_123",
  "properties": {
    "difficulty": "normal",
    "total_characters": 3,
    "favorite_city": "Baku"
  }
}
```

### Analytics Dashboard Data

Get aggregated analytics data for dashboards.

```http
GET /analytics/dashboard
```

#### Query Parameters

- `start_date`: ISO date string (required)
- `end_date`: ISO date string (required)
- `metrics`: Comma-separated metrics list
- `dimensions`: Comma-separated dimensions list

#### Response

```json
{
  "metrics": {
    "total_sessions": 1250,
    "average_session_duration": 1800,
    "active_users": 450,
    "retention_rate": 0.68
  },
  "dimensions": {
    "difficulty_distribution": {
      "easy": 350,
      "normal": 400,
      "hard": 120,
      "extreme": 20
    }
  }
}
```

---

## 🎮 Game API

### Start New Game

```http
POST /games
```

#### Request Body

```json
{
  "difficulty": "normal",
  "character_id": "char_123"
}
```

#### Response

```json
{
  "game": {
    "id": "game_456",
    "difficulty": "normal",
    "current_year": 2024,
    "current_age": 0,
    "is_playing": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Game State

```http
GET /games/{game_id}
```

#### Response

```json
{
  "game": {
    "id": "game_456",
    "difficulty": "normal",
    "current_year": 2030,
    "current_age": 6,
    "is_playing": true,
    "character": {
      "id": "char_123",
      "stats": {
        "health": 85,
        "happiness": 70,
        "wealth": 60,
        "energy": 80
      }
    }
  }
}
```

### Update Game State

```http
PUT /games/{game_id}
```

#### Request Body

```json
{
  "current_year": 2031,
  "current_age": 7,
  "statistics": {
    "choices_made": 15,
    "events_experienced": 8
  }
}
```

### Save Game

```http
POST /games/{game_id}/save
```

#### Request Body

```json
{
  "auto_save": false,
  "save_name": "Before big decision"
}
```

### Load Game

```http
GET /games/{game_id}/load/{save_id}
```

---

## 👤 Character API

### Create Character

```http
POST /characters
```

#### Request Body

```json
{
  "name": "John Doe",
  "age": 0,
  "birth_year": 1995,
  "birth_city": "Baku",
  "gender": "male"
}
```

#### Response

```json
{
  "character": {
    "id": "char_123",
    "info": {
      "name": "John Doe",
      "age": 0,
      "birth_year": 1995,
      "birth_city": "Baku",
      "gender": "male"
    },
    "stats": {
      "health": 100,
      "happiness": 100,
      "wealth": 100,
      "energy": 100
    },
    "skills": {
      "intelligence": 50,
      "creativity": 50,
      "social": 50,
      "physical": 50,
      "business": 50,
      "technical": 50
    }
  }
}
```

### Get Character

```http
GET /characters/{character_id}
```

### Update Character Stats

```http
PUT /characters/{character_id}/stats
```

#### Request Body

```json
{
  "health": 85,
  "happiness": 70,
  "wealth": 60,
  "energy": 80
}
```

### Add Character Event

```http
POST /characters/{character_id}/events
```

#### Request Body

```json
{
  "type": "education",
  "title": "Started School",
  "description": "Began primary education",
  "year": 2001,
  "age": 6,
  "impact": {
    "intelligence": 5,
    "social": 3
  }
}
```

---

## 🔒 Security API

### Security Audit

```http
POST /security/audit
```

#### Request Body

```json
{
  "device_info": {
    "platform": "android",
    "os_version": "13",
    "app_version": "3.0.0"
  }
}
```

#### Response

```json
{
  "audit_id": "audit_789",
  "vulnerabilities": {
    "critical": [],
    "high": [
      {
        "id": "AUTH_001",
        "title": "Authentication Bypass",
        "description": "Check for authentication bypass vulnerabilities",
        "recommendation": "Implement robust authentication mechanisms"
      }
    ],
    "medium": [...],
    "low": [...]
  },
  "score": 85,
  "recommendations": [
    "Address all high-severity security issues",
    "Implement regular security audits"
  ]
}
```

### Input Validation

```http
POST /security/validate
```

#### Request Body

```json
{
  "field_name": "character_name",
  "value": "John Doe",
  "validation_rules": ["required", "min_length:2", "max_length:50"]
}
```

#### Response

```json
{
  "is_valid": true,
  "sanitized_value": "John Doe",
  "errors": [],
  "warnings": []
}
```

### Rate Limit Check

```http
GET /security/rate-limit/{identifier}
```

#### Response

```json
{
  "allowed": true,
  "remaining": 85,
  "reset_time": 1634567890123,
  "limit": 100,
  "window": 900000
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "character_name",
      "issue": "Name is too short"
    },
    "timestamp": "2024-01-01T12:00:00Z",
    "request_id": "req_123"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Invalid credentials |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 🚦 Rate Limiting

### Default Limits

- **Standard API**: 100 requests per 15 minutes
- **Analytics API**: 1000 requests per 15 minutes
- **Security API**: 50 requests per 15 minutes

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1634567890123
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 100,
      "window": 900000,
      "reset_time": 1634567890123
    }
  }
}
```

---

## 💡 Examples

### JavaScript/TypeScript Example

```typescript
class LifeSimulatorAPI {
  private apiKey: string;
  private baseURL = 'https://api.lifesimulator.az/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCharacter(characterData: CharacterData): Promise<Character> {
    const response = await fetch(`${this.baseURL}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async trackEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    await fetch(`${this.baseURL}/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: Date.now(),
      }),
    });
  }
}

// Usage
const api = new LifeSimulatorAPI('your-api-key');

const character = await api.createCharacter({
  name: 'John Doe',
  age: 0,
  birth_year: 1995,
  birth_city: 'Baku',
  gender: 'male',
});

await api.trackEvent('character_created', {
  difficulty: 'normal',
  birth_city: character.info.birth_city,
});
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseCharacterReturn {
  character: Character | null;
  loading: boolean;
  error: string | null;
  createCharacter: (data: CharacterData) => Promise<void>;
}

export const useCharacter = (apiKey: string): UseCharacterReturn => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCharacter = async (data: CharacterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.lifesimulator.az/v1/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }

      const result = await response.json();
      setCharacter(result.character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return {
    character,
    loading,
    error,
    createCharacter,
  };
};
```

---

## 📞 Support

For API support:

- 📧 Email: api-support@lifesimulator.az
- 📚 Documentation: [docs.lifesimulator.az](https://docs.lifesimulator.az)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/lifesimulator/api/issues)
- 💬 Discord: [API Support Channel](https://discord.gg/lifesimulator-api)

---

**🎮 Life Simulator Azerbaijan API - Power Your Game Experience! 🇦🇿**
