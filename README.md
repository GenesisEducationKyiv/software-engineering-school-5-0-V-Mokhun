# Weather Subscription Service 🌦️

This project is a resilient, microservices-based weather notification system. It allows users to subscribe to weather updates for specific cities and receive periodic email notifications. The application is designed to be scalable and maintainable, leveraging a modern backend architecture with Node.js, TypeScript, and Docker.

## Key Features

- **User Subscriptions**: Subscribe to weather updates for any city.
- **Email Confirmation**: Secure subscription process with email verification.
- **Configurable Frequency**: Receive updates hourly or daily.
- **Background Job Processing**: Asynchronous tasks like sending emails are handled by a dedicated worker service.
- **Unsubscribe**: Easily manage and cancel subscriptions.

## Architecture

The system is built on a microservices architecture, with two main services:

- **Weather Service**: A public-facing API that handles user interactions like subscribing, confirming, and unsubscribing.
- **Notifications Service**: A background worker that processes jobs from a queue to send out emails and fetch weather data.

For a detailed visual representation of the architecture, please see the [Architecture Diagram](backend/docs/app-architecture.md) and the [System Design Document](backend/docs/system-design.md).

## Tech Stack

- **Backend**: **Node.js** with **Express** for building efficient and scalable server-side applications.
- **Architecture**: **Microservices** using **npm workspaces** to create a modular and maintainable monorepo.
- **Database**: **PostgreSQL** as the robust relational database for storing subscription data.
- **Cache & Queue**: **Redis** with **BullMQ** for high-performance caching and managing background job queues.
- **Email Service**: **SendGrid** for reliable email delivery.
- **Testing**: **Jest** with **Supertest** for unit and integration testing.
- **Type Safety**: **TypeScript** for robust, type-safe code.
- **API Validation**: **Zod** for schema validation and type generation.
- **Containerization**: **Docker & Docker Compose** for consistent development and production environments.

## Project Structure

The backend is a monorepo containing multiple services and shared packages.

```
backend/
├── apps/
│   ├── weather/          # Handles all user-facing HTTP requests (subscribing, confirming, etc.).
│   │   ├── src/            # Service source code.
│   │   ├── prisma/         # Database schema, migrations, and seeds.
│   │   ├── .env.example    # Example environment variables.
│   │   ├── Dockerfile      # Docker configuration for the service.
│   │   └── package.json    # Service-specific dependencies and scripts.
│   └── notifications/    # A background worker that processes jobs from a queue to send out emails.
│       ├── src/            # Service source code.
│       ├── prisma/         # Database schema, migrations, and seeds.
│       ├── .env.example    # Example environment variables.
│       ├── Dockerfile      # Docker configuration for the service.
│       └── package.json    # Service-specific dependencies and scripts.
├── packages/
│   ├── common/           # A shared library with code for DB clients, queue configs, shared types, and repository interfaces.
│   └── logger/           # A shared logger implementation.
├── proto/                # Protocol Buffer definitions for inter-service communication.
├── docker-compose.yml    # Docker Compose for production.
├── docker-compose.dev.yml # Docker Compose for development.
└── package.json          # Root package.json with workspace configurations.
```

## Getting Started

All commands should be run from the `backend` directory.

```bash
cd backend
```

## Environment Setup

Each service requires its own environment file. You'll need to create a `.env` or `.env.development` file inside each app's directory (i.e., `apps/weather/` and `apps/notifications/`). You can use the `.env.example` files in each directory as a template.

## Running the Application with Docker

The easiest way to get started is by using Docker Compose, which orchestrates all the services, including the database and cache.

### Development

```bash
# Build and create the containers. The -d flag runs them in the background.
npm run docker:build:dev

# Start all services.
npm run docker:run:dev
```

### Production

```bash
# Build the production-ready containers.
npm run docker:build

# Start the services in production mode.
npm run docker:run
```

## Testing

The test suite includes unit tests for individual components and integration tests to verify the interactions between different parts of the services.

Before running the tests, ensure you have generated the Prisma client:

```bash
# if you didn't run prisma generate, run it first
npm run db:generate
```

Then, run all tests with:

```bash
npm run test
```
