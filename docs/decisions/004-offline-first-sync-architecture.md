# 4. Offline-First Mobile and API Synchronization Architecture

Date: 2026-10-04

## Status

Accepted

## Context

ApplyAlert is a mobile-first application where users frequently save opportunities, review deadlines, and check their application pipeline on mobile devices in conditions with unstable or no network connectivity.

We needed an architectural strategy to connect the React Native mobile client to the NestJS backend without sacrificing offline-first guarantees or risking data loss.

## Decision

We established an **Offline-First Primary Local Storage** architecture:

1. **MMKV + TanStack Query as Source of Truth on Device:**
   - The local repository backed by MMKV remains the primary, immediate read-and-write store for the mobile app.
   - All screen interactions (creating, updating, transitioning status, archiving, filtering) operate instantaneously against the local store without blocking on network roundtrips.
2. **Decoupled API Client (`apps/mobile/src/data/services/api/`):**
   - A fully-typed `ApiClient` operates as the network communication bridge.
   - It adheres strictly to `@applyalert/contracts` request/response types.
   - Configurable for local development, Android emulator (`10.0.2.2`), and remote environments.
3. **Foundation for Future Synchronization:**
   - Prepares for future sync queue (optimistic mutations, conflict resolution based on `updatedAt` timestamps, and device registration).
   - In Task 4, the API client is fully integrated and tested, ready to be attached to background sync workers in subsequent milestones.

## Consequences

- Zero regressions to mobile responsiveness or offline accessibility.
- Clean separation between local domain persistence and backend synchronization transport.
