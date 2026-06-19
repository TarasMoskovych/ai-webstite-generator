# AI Website Generator

Generate complete websites from text descriptions or screenshots using Claude AI.

## Features

- **Text-to-Website**: Describe what you want, get a complete HTML/CSS website
- **Screenshot-to-Website**: Upload a screenshot and get a replica website
- **Real-time Streaming**: Watch your website being generated in real-time
- **Code Editor**: Edit HTML and CSS with syntax highlighting
- **Live Preview**: See changes instantly with desktop/tablet/mobile views
- **Dark Theme Support**: Generated websites include automatic dark mode
- **Download Options**: Export as single HTML file or ZIP archive
- **User Dashboard**: Save, manage, and organize your generated websites
- **Public Showcase**: Share your creations with the community

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: Anthropic Claude API (Haiku 4.5)
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Image Processing**: Sharp
- **Testing**: Vitest + fast-check

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key
- Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-website-generator.git
   cd ai-website-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   # Anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key

   # Firebase Client
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

**Note**: The API routes are configured with `maxDuration = 60` for Vercel Hobby plan. Upgrade to Pro for up to 300 seconds if needed.

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication → Google Sign-In
3. Create a Firestore database
4. Add your Vercel domain to authorized domains in Firebase Auth settings
5. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── generate/      # Website generation endpoints
│   ├── dashboard/         # User dashboard
│   ├── generate/          # Generation page
│   ├── showcase/          # Public showcase
│   └── website/[id]/      # Website detail view
├── components/            # React components
├── lib/                   # Configuration (Claude, Firebase, constants)
├── services/              # Business logic
│   ├── generation/        # AI generation services
│   ├── validation/        # Input validation
│   └── ...
├── types/                 # TypeScript types
└── tests/                 # Test utilities and mocks
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate website (non-streaming) |
| `/api/generate/stream` | POST | Generate website with SSE streaming |

## Limits

- **Text Input**: 10 - 10,000 characters
- **Screenshot**: PNG/JPEG/WebP, max 10MB, auto-resized if > 7680px
- **Generation Timeout**: 60 seconds (Hobby) / 300 seconds (Pro)

## License

MIT
