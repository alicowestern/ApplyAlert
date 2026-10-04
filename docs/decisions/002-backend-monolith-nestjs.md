# 2. Modular Monolith Backend with NestJS

Date: 2026-10-04

## Status

Accepted

## Context

ApplyAlert requires a reliable, typed, maintainable backend to serve opportunity tracking, future AI processing pipelines, background jobs, and cloud synchronization. 

We needed to decide between:
1. Microservices architecture (separate services for auth, opportunities, scraper, AI).
2. Serverless functions (AWS Lambda / Cloud Functions).
3. Modular monolith using NestJS.

## Decision

We chose a **Modular Monolith using NestJS** with Node.js and TypeScript.

### Rationale:
- **Single Deployment Unit & Simplicity:** At our current stage, microservices introduce severe network overhead, complex distributed tracing, and coordination friction without scalability benefits.
- **Strong Modularity:** NestJS enforces modular boundaries (`HealthModule`, `OpportunitiesModule`, `PrismaModule`) that can easily be extracted into standalone microservices later if scaling bottlenecks arise.
- **Shared Monorepo Types:** NestJS TypeScript seamlessly shares DTOs, Zod schemas, and domain models directly from `@applyalert/contracts` and `@applyalert/validation`.
- **Integrated Tooling:** Built-in support for Dependency Injection, OpenAPI/Swagger documentation, exception filters, interceptors, and configuration management.

## Consequences

- Direct imports across module boundaries are avoided; all inter-module communication is dependency-injected.
- Future queues and workers (e.g. BullMQ / Redis for AI extraction) will run within the monolith worker process before requiring external microservices.
