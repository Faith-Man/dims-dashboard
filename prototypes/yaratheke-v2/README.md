# YARATHĒKĒ™ v2 Reader / Writer / Editor Prototype

Status: read-only prototype. Production behavior is unchanged.

## Purpose

This prototype implements the information-architecture decisions from DIMS-AUD-0002: storage/governance is separated from the reader experience; YARATHĒKĒ is reader-centered; OrEl is writer-centered; Editor/Admin exposes enterprise governance without burdening the reader.

## Included views

- Library Home
- KEEP THE GARDEN™ Series Home
- KEEP THE GARDEN™ Lesson One Reader View
- SHAMAR™ Reader View
- Distinct Dominion1st Perspective, Diagnosis, and Principle cards
- OrEl™ Writer View
- Editor/Admin View
- Mobile-responsive Reader View

## Reader portability

Reader View preserves normal text selection and provides:

- Copy Full Teaching
- Download → PDF/Print, Word-compatible, Plain Text
- Share when the device/browser supports Web Share
- Print

Copy/Download are based on reader content and do not expose internal DIMS storage metadata. Reader attribution remains attached.

## Design rules demonstrated

- STORAGE IS NOT THE READER EXPERIENCE.
- Standardize the architecture, not the personality of the content.
- Series are ordered by sequence/lesson number, not raw creation date.
- Governance metadata is secondary behind “About this artifact.”
- Preview as Reader uses the same Reader View concept.
- Mobile is a purpose-built single-column reading surface, not a shrunken admin dashboard.

## Prototype boundary

This branch intentionally does not change Supabase schema, production routes, current deployment files, or legacy Drive organization. It is a controlled UI/UX proof before migration and production implementation.
