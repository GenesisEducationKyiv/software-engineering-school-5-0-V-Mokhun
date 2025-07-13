# ADR-001: Choosing a Job Queue Management System for processing scheduled/background jobs

- Status: Accepted
- Date: 2025-06-07
- Author: Volodymyr Mokhun

## Context

Weather subscription service requires reliable background job processing for several critical operations:

- Email confirmation processing
- Weather notification delivery
- Email delivery failure handling

## Requirements

- Reliability: Jobs must not be lost even if the application crashes
- Scheduling: Support for delayed and recurring jobs (hourly/daily notifications)
- Scalability: Handle growing number of subscribers and cities
- Retry Logic: Robust failure handling with exponential backoff
- Monitoring: Ability to track job progress and failures

## Options Reviewed

### 1. node-cron

Pros:

- Simple for basic scheduling
- No external dependencies
- Full control over implementation

Cons:

- No persistence (jobs lost on restart)
- No retry mechanisms
- No scalability across multiple instances

### 2. PostgreSQL-based Queue

Pros:

- Uses existing PostgreSQL database
- ACID transactions
- No additional infrastructure

Cons:

- Database overhead for high-frequency jobs
- PostgreSQL not optimized for queue operations
- Limited performance compared to Redis-based solutions

### 3. BullMQ

Pros:

- Modern, actively maintained successor to Bull
- Built-in TypeScript support
- Advanced features: job scheduling, priorities, rate limiting
- Good retry mechanisms with exponential backoff
- Ability to add UI Dashboard for monitoring (bull-board)

Cons:

- Relatively newer library (potential stability concerns)
- Learning curve for advanced features
- Redis dependency (single point of failure)

## Decision

Selected: BullMQ

```
src/lib/queue/
├── config.ts           # Redis connection and base config
├── constants.ts        # Queue and job type definitions
├── types.ts           # TypeScript type definitions
├── lib.ts              # Job initialization and cleanup
├── jobs/              # Job processor implementations
│   ├── confirm-email/
│   ├── send-weather-update-email/
│   └── update-weather-data/
└── schedulers/        # Job scheduling logic
```

## Consequences

Positive:

- Reliability: Jobs are not lost even if the application crashes. Built-in retry mechanisms.
- Scalability: Can handle growing number of subscribers and cities.
- Performance: Efficient Redis-based storage and processing. Support for job priorities and rate limiting.
- Maintainability: Strong TypeScript support. Clear separation of concerns with job processors.

Negative:

- Infrastructure Complexity: Additional Redis dependency to maintain
- Learning Curve: Advanced features require additional learning.
- Resource Usage: Redis memory consumption for job storage
