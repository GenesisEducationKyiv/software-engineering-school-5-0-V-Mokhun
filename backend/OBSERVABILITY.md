# Observability and Monitoring Guide

This document outlines the monitoring strategy and alerting configuration for the Weather Subscription Service. The system uses structured logging with Winston/Loki and Prometheus metrics to provide comprehensive observability.

## 1. Logging Infrastructure

### 1.1 Logging Implementation

The application uses a centralized logging system with Winston and Loki.

**Log Levels and Sampling:**

- **Development**: Full logging (error: 100%, warn: 100%, info: 100%, debug: 50%)
- **Production**: Reduced logging (error: 100%, warn: 100%, info: 10%, debug: 1%)
- **Test**: Full logging for debugging

## 2. Alerting Configuration

### 2.1 Critical Alerts (P0)

#### Service Availability

```yaml
# Service Down Alert
alert: ServiceDown
expr: up{job=~"weather-service|notifications-service"} == 0
for: 1m
labels:
  severity: critical
annotations:
  summary: "Service {{ $labels.instance }} is down"
  description: "Service {{ $labels.instance }} has been down for more than 1 minute"
```

#### High Error Rate

```yaml
# High HTTP Error Rate
alert: HighHTTPErrorRate
expr: rate(http_request_errors_total[5m]) / rate(http_requests_total[5m]) > 0.05
for: 2m
labels:
  severity: critical
annotations:
  summary: "High HTTP error rate on {{ $labels.instance }}"
  description: "HTTP error rate is {{ $value | humanizePercentage }} for the last 5 minutes"
```

### 2.2 High Priority Alerts (P1)

#### Queue Processing Issues

```yaml
# Job Processing Failures
alert: JobProcessingFailures
expr: rate(jobs_failed_total[10m]) > 0.1
for: 5m
labels:
  severity: high
annotations:
  summary: "High job failure rate on {{ $labels.instance }}"
  description: "Job failure rate is {{ $value }} per second over the last 10 minutes"
```

#### Email Delivery Failures

```yaml
# Email Delivery Failures
alert: EmailDeliveryFailures
expr: rate(email_delivery_errors_total[10m]) / rate(email_deliveries_total[10m]) > 0.1
for: 5m
labels:
  severity: high
annotations:
  summary: "High email delivery failure rate"
  description: "Email delivery failure rate is {{ $value | humanizePercentage }} over the last 10 minutes"
```

#### Weather Provider Issues

```yaml
# Weather Provider Failures
alert: WeatherProviderFailures
expr: rate(weather_provider_request_error_count_total[10m]) / rate(weather_provider_request_count_total[10m]) > 0.2
for: 5m
labels:
  severity: high
annotations:
  summary: "Weather provider failures on {{ $labels.instance }}"
  description: "Weather provider error rate is {{ $value | humanizePercentage }} over the last 10 minutes"
```

#### High Response Times

```yaml
# High HTTP Response Times
alert: HighHTTPResponseTime
expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
for: 3m
labels:
  severity: high
annotations:
  summary: "High HTTP response times on {{ $labels.instance }}"
  description: "95th percentile response time is {{ $value }}s over the last 5 minutes"
```

### 2.3 Medium Priority Alerts (P2)

#### Resource Utilization

```yaml
# High Memory Usage
alert: HighMemoryUsage
expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.85
for: 10m
labels:
  severity: medium
annotations:
  summary: "High memory usage on {{ $labels.instance }}"
  description: "Memory usage is {{ $value | humanizePercentage }}"
```

#### High CPU Usage

```yaml
# High CPU Usage
expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
for: 10m
labels:
  severity: medium
annotations:
  summary: "High CPU usage on {{ $labels.instance }}"
  description: "CPU usage is {{ $value }}%"
```

## 3. Alert Importance and Rationale

### 3.1 Critical Alerts (P0)

**Why Critical:**

- **Service Down**: Complete service unavailability affects all users
- **High Error Rate**: Indicates systemic issues affecting user experience

**Impact:**

- User-facing functionality completely unavailable
- Data loss or corruption risk
- Immediate business impact

### 3.2 High Priority Alerts (P1)

**Why High Priority:**

- **Job Processing Failures**: Background tasks failing affect user notifications
- **Email Delivery Failures**: Core business functionality (notifications) impaired
- **Weather Provider Issues**: External dependency failures affecting service quality
- **High Response Times**: Poor user experience and potential cascading failures

**Impact:**

- Degraded user experience
- Loss of business functionality
- Potential for cascading failures

### 3.3 Medium Priority Alerts (P2)

**Why Medium Priority:**

- **Resource Utilization**: Performance degradation indicators

**Impact:**

- Performance degradation
- Increased operational costs
- Potential for escalation to higher priority
