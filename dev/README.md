# Kep - Collaborative Meeting Agenda App

Kep is a Nostr-based web application that helps distributed and diverse teams co-create meeting agendas. It enables team members to submit agenda items anonymously or pseudonymously and allows meeting facilitators to curate and prioritize topics for discussion.

## Features

### Core Features
- Weekly agenda threads are automatically created based on the date
- Submit agenda items anonymously or with your identity
- View and interact with other team members' agenda items
- Admin dashboard for agenda curation and management
- Export agenda as Markdown or JSON
- Optional AI-powered grouping of similar agenda items

### Accessibility Features
- Screen reader compatible layout
- Voice-to-text enabled input
- Light/dark mode based on user system settings with override
- ARIA labels and full keyboard navigation
- Accessible color palette and scalable text

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with shadcn/ui components
- **Nostr Protocol**: Nostrify for Nostr protocol integration
- **State Management**: React Query for data fetching and caching
- **Router**: React Router for navigation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
src/
├── components/         # UI components
│   ├── agenda/         # Agenda-specific components
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components
│   └── ui/             # Shared UI components (shadcn/ui)
├── hooks/              # Custom React hooks
│   └── useAgenda.ts    # Hooks for working with agenda items
├── lib/                # Utility functions
│   ├── nostr/          # Nostr protocol utilities
│   ├── ai/             # AI processing utilities
│   └── accessibility/  # Accessibility helpers
├── pages/              # Page components
│   ├── HomePage.tsx    # Home page with current agenda thread
│   └── AdminPage.tsx   # Admin dashboard
└── types/              # TypeScript type definitions
```

## Usage

### For Team Members

1. Log in using your Nostr identity (extension, nsec, or read-only)
2. View the current week's agenda thread
3. Submit your agenda items (anonymously if preferred)
4. Review the final agenda before the meeting

### For Admins

1. Access the admin dashboard to view all submitted agenda items
2. Star important items, reorder by priority
3. Group similar questions using the AI grouping feature
4. Export the final agenda as Markdown or JSON

## Future Extensions

Kep is designed to be extended in the future with:
- Audio/video input support
- Calendar/task exports to popular productivity tools
- Integration with decision-support systems
- Real-time collaboration features

## License

Creative Commons Attribution-NonCommercial 4.0 International
