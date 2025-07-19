# Weather Subscription Service - System Design Document

## Table of Contents

1. [Application Requirements](#1-application-requirements)
2. [Load Estimation](#2-load-estimation)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Detailed Component Design](#4-detailed-component-design)
5. [System Diagrams](#5-system-diagrams)

## 1. Application Requirements

### 1.1 Functional Requirements

- Users can subscribe/unsubscribe to weather updates for specific cities
- Users can choose notification frequency (hourly or daily)
- Users must confirm subscription via email
- System sends scheduled email notifications with weather information
- System caches weather data to reduce API calls
- Track email delivery status and failures

### 1.2 Non-Functional Requirements

**Performance:**

- API response time < 500ms for 95% of requests
- System can handle 10,000 concurrent users

**Reliability:**

- 99.9% uptime
- Automatic retry for failed operations

**Scalability:**

- Support 1 million active subscriptions
- Queue system can handle 100,000 jobs/hour

**Security:**

- All API inputs validated and sanitized
- Secure token generation for confirmations/unsubscribe

### 1.3 Constraints

- Free tier limitations of external APIs
- GDPR compliance for EU users
- Budget constraints for minimal infrastructure

## 2. Load Estimation

### 2.1 Users and Traffic

- **Active users**: 100,000
- **Estimated subscriptions per user**: 3-5
- **API requests**: 50 RPS
- **Background jobs**: 800,000 jobs/day

### 2.2 Data Estimation

**Database Storage:**

- **Subscriptions**: 200 bytes/record
- **Weather Cache**: 150 bytes/record
- **Email Logs**: 300 bytes/record
- **Total Database**: ~150 GB/year

**Redis Memory:**

- **Active jobs**: 500 bytes/record
- **Job history**: 500 bytes/record
- **Total Redis**: ~500MB/day

### 2.3 Bandwidth Estimation

- **Incoming**: 1Mbps
- **Outgoing**: 5Mbps
- **External API**: 20Mbps

## 3. High-Level Architecture

```mermaid
graph TB
    subgraph "User Interaction"
        User[Users]
    end

    subgraph "Weather Service"
        API[Express API Server]
    end

    subgraph "Notifications Service"
        Worker[Background Workers]
    end
    
    subgraph "Data & Communication Layer"
        PG[(PostgreSQL)]
        Redis[(Redis / BullMQ)]
    end

    subgraph "External Services"
        WeatherAPI[WeatherAPI.com]
        Email[SendGrid]
    end

    User --> API
    API -- "Manages subscriptions" --> PG
    API -- "Dispatches jobs" --> Redis
    
    Worker -- "Pulls jobs" --> Redis
    Worker -- "Fetches sub data" --> PG
    Worker -- "Fetches weather data" --> WeatherAPI
    Worker -- "Sends emails" --> Email

```

**Core Components:**

1.  **Weather Service**: An Express.js REST API responsible for handling user-facing requests, such as subscriptions, confirmations, and unsubscribes. It is the single entry point for users.
2.  **Notifications Service**: A service composed of background workers that listen to job queues. It is responsible for all asynchronous tasks, including sending confirmation emails, fetching weather data, and sending weather update emails.
3.  **Database Layer**: PostgreSQL with Prisma ORM, used as the main persistence layer for subscriptions, weather data cache, and email logs.
4.  **Cache/Queue Layer**: Redis with BullMQ, used for queueing background jobs and for caching. It acts as the communication channel between the Weather and Notifications services.
5.  **External Integrations**: WeatherAPI.com for weather data and SendGrid for sending emails.

## 4. Detailed Component Design

### 4.1 Weather Service & Endpoints

**Responsibilities:**

- Handle all synchronous user-facing API requests.
- Validate and sanitize inputs.
- Manage subscription lifecycle (create, confirm, delete).
- Dispatch jobs to the queue for asynchronous processing by the Notifications Service.
- Handle errors and logging.

**REST API Endpoints:**

```typescript
// Subscription Management
POST /api/subscribe
GET  /api/confirm/:token
GET  /api/unsubscribe/:token

// Weather Data
GET  /api/weather?city={city}

// Health & Monitoring
GET  /health
```

### 4.2 Notifications Service & Queue System

**Responsibilities:**

- Process background jobs from the BullMQ queues.
- Handle job scheduling, retries, and failures.
- Integrate with external services like SendGrid and WeatherAPI.com.

**Queue System:**

```
BullMQ Job System
├── Queues
│   ├── confirm_email_queue
│   ├── weather_update_queue
│   └── send_weather_update_email_queue
├── Job Types
│   ├── confirm_email
│   ├── update_weather_data
│   └── send_weather_update_email
└── Workers (running in Notifications Service)
```

**Scheduling Strategy:**

- The Weather service schedules jobs upon subscription confirmation.
- **Hourly**: `0 * * * *` (every hour)
- **Daily**: `0 8 * * *` (8 AM daily)

### 4.3 Weather API Integration & Caching

**Weather Service Architecture:**

```
WeatherService
├── External API Client (WeatherAPI.com)
├── Response Transformation
├── Error Handling & Retries
└── Rate Limiting
```

**Caching Strategy:**

```
PostgreSQL WeatherCache Table
├── Cache Duration: 30 minutes
├── City-based indexing
└── Fallback to API on cache miss
```

**Data Flow:**

1. Check cache for recent data (< 30 min)
2. Return cached data if available
3. Fetch from WeatherAPI.com if cache miss
4. Transform and validate response
5. Store in cache with timestamp
6. Return weather data

## 5. System Diagrams

### 5.1 Subscription Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant WS as Weather Service (API)
    participant DB as PostgreSQL
    participant Q as Job Queue
    participant NS as Notifications Service (Worker)
    participant E as SendGrid

    U->>WS: POST /api/subscribe
    WS->>DB: Create subscription (unconfirmed)
    WS->>Q: Dispatch 'confirm-email' job
    WS->>U: 200 OK

    NS->>Q: Consume 'confirm-email' job
    NS->>E: Send confirmation email
    E->>U: Email with confirmation link

    U->>WS: GET /api/confirm/:token
    WS->>DB: Confirm subscription
    WS->>Q: Schedule 'update-weather-data' jobs
    WS->>U: 200 OK (confirmed)
```

### 5.2 Weather Update Process Diagram

```mermaid
sequenceDiagram
    participant S as Scheduler (in Weather Service)
    participant Q as Job Queue
    participant NS as Notifications Service (Worker)
    participant WeatherAPI as WeatherAPI.com
    participant DB as PostgreSQL
    participant E as SendGrid

    S->>Q: Schedules recurring 'update-weather-data' job
    
    loop For each scheduled job
        NS->>Q: Consume 'update-weather-data' job
        NS->>DB: Get subscription details
        NS->>WeatherAPI: Fetch weather data
        WeatherAPI->>NS: Weather response
        NS->>Q: Dispatch 'send-weather-update-email' job
    end

    loop For each weather update email job
        NS->>Q: Consume 'send-weather-update-email' job
        NS->>E: Send weather update email
        NS->>DB: Log email status
    end
```
