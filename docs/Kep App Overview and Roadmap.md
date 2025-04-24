# Kep App Overview and Roadmap

---

## App Name: Kep

Kep is a Nostr-based, privacy-respecting app designed to help distributed, diverse teams co-create meeting agendas and enhance decision-making workflows. It centers user accessibility, async collaboration, and integration with decentralized intelligence tools.

---

## Purpose and Vision

Kep enables teams to:
- Submit and curate agenda items anonymously or pseudonymously
- Facilitate inclusive input from all participants, regardless of location or ability
- Organize, prioritize, and synthesize discussion topics
- Integrate into broader workflows for action tracking and decision support

By anchoring in the Nostr protocol and embracing decentralized infrastructure, Kep advances data sovereignty and collaborative intelligence while remaining lightweight and user-friendly.

---

## Core Users and Accessibility Considerations

Kep is designed with a wide range of users in mind, including:

- **Async teams** (across time zones, without shared meeting hours)
- **Multilingual users** (via optional translations)
- **Neurodivergent individuals** (with structured prompt options and simple UI)
- **Deaf and hard-of-hearing users** (support for video input, future ASL support)
- **Low-vision or blind users** (screen reader compatibility, voice-to-text submission)
- **Globally distributed teams** (timezone-localized UI and reminders)

Accessibility-first design choices include:
- Light/dark mode synced with system settings (user override available)
- High-contrast, accessible color palette and text scaling
- ARIA labels and keyboard navigability

---

## Minimum Viable Product (MVP) Features

### User-Facing:
- Anonymous or display-name-based agenda submissions
- Mobile-friendly, minimal interface
- View current thread questions (admin-toggle visibility)

### Admin/Facilitator:
- Admin dashboard (pubkey-based access)
- View, highlight/star, and sort questions
- AI summarization (group similar items)
- Export options (Markdown, JSON)

### Platform:
- Weekly thread generation
- Private relay support for sensitive teams
- NIP-01 (unencrypted) and NIP-04 (encrypted) message compatibility

---

## Roadmap

### Phase 2
- Voting/prioritization on agenda items
- Multilingual thread support with optional real-time translation
- Workspace customization (theme, relay config, admin roles)
- Contributor badges and engagement metrics (privacy-preserving)

### Phase 3
- Audio/video input for submissions (sign language inclusion)
- Agenda-to-actions pipeline:
  - Transcription of meetings
  - Synthesis into action items, next steps, assignments
  - Calendar and task manager integration
- Public/private team memory archives

### Phase 4
- Organization-wide analysis layer:
  - Compare themes across team agendas
  - Integrate with GetHiveWise and Washi for collective decision support
- Cashu micro-payments and zap incentives
- AI-powered prompt helper for submission guidance

---

## Design System

- Clean, minimalist interface inspired by Notion and Linear
- Accessible color palette with optional team customization
- Responsive Tailwind-based frontend
- UX guided by inclusive design principles and user feedback

---

## Technical Overview

- Protocol: Nostr (NIP-01 and NIP-04)
- Architecture: Frontend (React/Vite), Backend (Nostr event handler + optional LLM support)
- AI: Summarization engine and future LLM prompt/response synthesis
- Private relay compatibility (configurable per team)

---

## License and Contributions

Kep will be released under an permissive open-source license. Contributions, issues, and feature requests will be managed via GitHub. Community feedback and accessibility audits will guide ongoing development.

---

## Maintainer

Created and maintained by Liz Sweigart — [NotThatKindOfDrLiz on GitHub](https://github.com/NotThatKindOfDrLiz/)

---

## Contact / Learn More

Project updates will be shared via Nostr, GitHub, and other relevant forums.

---
