# ChatGPT Clone

A modern, full-featured ChatGPT clone built with Angular 20, featuring real-time chat with Gemini AI, Firebase authentication, and a beautiful, responsive UI.

![Angular](https://img.shields.io/badge/Angular-20.2.0-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.0.0-orange.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)

## Features

- **Real-time AI Chat** - Powered by Google Gemini API with streaming responses
- **Firebase Authentication** - Email/password and Google OAuth
- **Chat Persistence** - All conversations saved to Firestore
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark/Light Theme** - Automatic theme switching with persistence
- **Modern Angular** - Standalone components, Signals, and new control flow
- **Accessibility** - Full keyboard navigation and ARIA support
- **Real-time Updates** - Live chat synchronization across devices

## Architecture

### Tech Stack

- **Frontend**: Angular 20 with Standalone Components
- **State Management**: Angular Signals
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **AI Integration**: Google Gemini API
- **Build Tool**: Angular CLI with Vite
- **TypeScript**: Strict mode enabled

### Project Structure

```
src/app/
├── core/                    # Core business logic
│   ├── guards/             # Route guards (Auth, Guest)
│   ├── models/             # TypeScript interfaces
│   └── services/           # Business services
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   ├── chat/               # Chat functionality
│   ├── settings/           # User settings
│   └── sidebar/            # Navigation sidebar
├── shared/                 # Shared components & utilities
│   ├── components/         # Reusable components
│   ├── services/           # Shared services
└── environments/           # Environment configuration
```

### Key Components

- **ChatService** - Central state management with Signals
- **FirebaseService** - Authentication and data persistence
- **GeminiService** - AI API integration with streaming
- **SettingsService** - User preferences and theme management
- **BaseModalComponent** - Reusable modal system
- **AuthGuard/GuestGuard** - Route protection

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                        Angular App                         │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Auth      │  │    Chat     │  │  Settings   │         │
│  │  Feature    │  │   Feature   │  │  Feature    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├────────────────────────────────────────────────────────────┤
│                    Core Services                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ ChatService │  │ FirebaseSvc │  │GeminiService│         │
│  │ (Signals)   │  │  (Auth/DB)  │  │ (AI API)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├────────────────────────────────────────────────────────────┤
│                    External Services                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Firebase   │  │   Gemini    │  │   Tailwind  │         │
│  │ (Auth/DB)   │  │    AI       │  │    CSS      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└────────────────────────────────────────────────────────────┘
```

## Setup & Installation

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase project
- Google AI Studio API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-gpt-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

The project uses Angular's built-in environment configuration system with multiple environments:

- **Development**: Used during local development (`ng serve`)
- **Staging**: For testing in a production-like environment
- **Production**: For the live application

#### Setup for Local Development:

Copy the example development environment file:

```bash
cp src/environments/environment.development.example.ts src/environments/environment.development.ts
```

Update `environment.development.ts` with your configuration:

#### Setup for Production:

Copy the example production environment file:

```bash
cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
```

Update `environment.prod.ts` with your production configuration:

```typescript
export const environment = {
  production: false,
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'YOUR_APP_ID',
  },
};
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Update your Firebase config in `environment.development.ts`

### 5. Gemini API Setup

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add the key to your `environment.development.ts`

### 6. Start Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`

#### Running with Different Environments:

```bash
# Development (default)
ng serve

# Production
ng serve --configuration=production

# Staging
ng serve --configuration=staging
```

## Testing

### Unit Tests

```bash
npm test
# or
ng test
```

### E2E Tests

```bash
npm run e2e
# or
ng e2e
```

### Linting

```bash
npm run lint
```

## Deployment

### Build for Production

```bash
# Production build
npm run build -- --configuration=production
# or
ng build --configuration=production

# Staging build
ng build --configuration=staging
```

### Deployment to Netlify

This project is configured for easy deployment to Netlify. The `netlify.toml` file contains the necessary configuration:

```toml
[build]
  command = "npm run build -- --configuration=production"
  publish = "dist/chat-gpt-clone/browser"

[build.environment]
  NODE_VERSION = "22"
```

To deploy:

1. Push your code to a Git repository
2. Connect your repository to Netlify
3. Configure environment variables in Netlify (Settings → Environment variables):
   - `GEMINI_API_KEY`
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

## Usage

### Getting Started

1. **Sign Up/Login** - Create an account or use Google OAuth
2. **Start Chatting** - Type your message and get AI responses
3. **Manage Chats** - Create new chats, delete old ones
4. **Customize Settings** - Adjust AI parameters and theme

### Keyboard Shortcuts

- `Escape` - Close modals
- `Enter` - Send message
- `Shift + Enter` - New line in message

## Development

### Code Generation

```bash
# Generate a new component
ng generate component feature-name/component-name

# Generate a new service
ng generate service core/services/service-name

# Generate a new guard
ng generate guard core/guards/guard-name
```

### Architecture Decisions

#### Signals vs RxJS

- **Signals** for component state and computed values
- **RxJS** for HTTP requests and real-time streams
- **toObservable()** to bridge between Signals and RxJS

#### State Management

- Centralized state in services using Signals
- Computed values for derived state
- Effects for side effects (navigation, persistence)

#### Component Design

- Standalone components for better tree-shaking
- Feature-sliced architecture for scalability
- Reusable components with clear APIs

## Design System

### Theme Support

- Light and dark themes
- Automatic system theme detection
- Persistent theme preference
- Smooth transitions between themes

### Responsive Design

- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## Security

- Firebase Authentication with JWT tokens
- Route guards for protected pages
- Input validation and sanitization
- Secure API key management
- HTTPS enforcement in production

## Performance

### Performance Budget

This project maintains strict performance budgets to ensure optimal user experience:

#### Bundle Size Limits (Angular.json configuration)

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "1.5MB",
    "maximumError": "2MB"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "6kB",
    "maximumError": "10kB"
  }
]
```

#### Lighthouse Performance Targets

| Metric                         | Target | Current | Status |
| ------------------------------ | ------ | ------- | ------ |
| Performance Score              | ≥90    | 90      | ✅     |
| First Contentful Paint (FCP)   | ≤1.8s  | 1.2s    | ✅     |
| Largest Contentful Paint (LCP) | ≤2.5s  | 1.8s    | ✅     |
| First Input Delay (FID)        | ≤100ms | 45ms    | ✅     |
| Cumulative Layout Shift (CLS)  | ≤0.1   | 0.05    | ✅     |

#### Performance Optimizations

**Bundle Optimization:**

- Tree-shaking with standalone components
- Lazy loading for route components
- Code splitting by feature modules
- Dynamic imports for heavy libraries

**Runtime Performance:**

- OnPush change detection strategy
- Angular Signals for efficient reactivity
- Image lazy loading with Intersection Observer
- Service Worker for caching (coming soon)

**Network Optimization:**

- HTTP interceptors for request optimization
- Request cancellation on route changes
- Optimized API calls with debouncing
- Efficient Firebase query patterns

#### Performance Monitoring

**Development Tools:**

```bash
# Analyze bundle size
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/chat-gpt-clone/browser/stats.json

# Performance profiling
ng build --source-map
ng serve --source-map

# Lighthouse CI (in CI/CD pipeline)
npm run lighthouse
```

**Production Monitoring:**

- Real User Monitoring (RUM) with Firebase Performance
- Core Web Vitals tracking
- Error monitoring with Firebase Crashlytics
- Bundle analysis in CI/CD pipeline

#### Performance Best Practices

1. **Component Optimization:**
   - Use `OnPush` change detection where beneficial
   - Implement `trackBy` functions for `*ngFor`
   - Minimize DOM manipulations
   - Use Angular Signals for reactive state

2. **Image Optimization:**
   - Lazy loading with custom directive
   - WebP format with fallbacks
   - Responsive images with `srcset`
   - Proper image sizing

3. **Network Optimization:**
   - HTTP/2 server push for critical resources
   - Service Worker for offline functionality
   - Efficient caching strategies
   - CDN for static assets

4. **Bundle Optimization:**
   - Regular bundle analysis
   - Unused code elimination
   - Efficient third-party library usage
   - Module federation for micro-frontends (future)

#### Performance Testing

**Automated Testing:**

```bash
# Performance regression testing
npm run test:performance

# Lighthouse CI in pipeline
npm run lighthouse:ci

# Bundle size monitoring
npm run analyze:bundle
```

**Manual Testing:**

- Regular Lighthouse audits
- Network throttling tests
- Device performance testing
- Accessibility performance checks

**Built by [seygorin](https://github.com/seygorin) for RS School Angular Course**
