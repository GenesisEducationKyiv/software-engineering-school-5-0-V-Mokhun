# Testing Guide

This document provides instructions for running the various tests in this project.

## Prerequisites

### Bash

### Node.js

### Docker

Integration tests require a running PostgreSQL database and a Redis instance. You can easily spin up a test environment using Docker Compose. Make sure you have Docker installed and running on your machine.

## Running Tests

You can run tests either through an automated script (recommended for integration tests) or by running the npm scripts directly.

### Unit Tests

To run only the unit tests, execute the following command:

```bash
npm run test:unit
```

### Integration Tests

To run only the integration tests, execute the following command:

```bash
npm run test:integration:ci
```

### Running All Tests

To run all tests (unit and integration), you can use the `test` script.

```bash
npm run test
```
