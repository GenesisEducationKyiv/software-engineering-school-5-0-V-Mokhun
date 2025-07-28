# Log Retention Policy

This document outlines the log retention strategy for the Weather Subscription Service, defining how long different types of logs are retained, when they are archived or deleted, and the rationale behind these decisions.

## Application Logs (Winston and Loki)

### Production Environment

- **Error Logs**: 90 days
- **Warning Logs**: 60 days
- **Info Logs**: 30 days
- **Debug Logs**: 7 days

### Development Environment

- **All Log Levels**: 30 days

## Rationale for Retention Decisions

**90 Days for Production Logs:**

- **Operational Value**: Sufficient time for incident investigation
- **Performance**: Balances storage costs with accessibility
- **Compliance**: Meets most regulatory requirements
- **Debugging**: Adequate time for post-incident analysis

**30 Days for Development Logs:**

- **Rapid Iteration**: Development cycles are short
- **Storage Efficiency**: Reduces storage costs in non-production
- **Debugging Focus**: Recent logs are most relevant for development
