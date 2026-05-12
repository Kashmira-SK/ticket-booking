## [2026-05-12] - Frontend UI Redesign

### Added
- Complete dark theme redesign across all pages (violet/fuchsia accent palette)
- Frosted glass fixed navbar with gradient logo and mobile hamburger menu
- Split-panel layout for Login and Register pages
- Hero section with radial violet glow on EventList homepage
- Skeleton loading cards on EventList and all admin pages
- Ticket-aesthetic cards with dashed tear line in MyTickets
- Physical ticket design with QR code display
- AdminDashboard stats grid with colored icon cards
- AdminEvents create/edit form with inline seat category management
- Two-column EventDetail layout with sticky booking widget
- Reusable UI primitives: Button, Input, Badge, Card, SkeletonCard
- Inter font via Google Fonts
- Custom dark scrollbar styles
- Stripe Elements dark theme overrides in index.css

### Fixed
- Login/Register auth flow wired to AuthContext correctly (token + user stored in localStorage)
- lucide-react installed as missing dependency
