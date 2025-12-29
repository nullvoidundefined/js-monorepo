# Project Structure

```
js-monorepo/
├── apps/
│   ├── client-web/              # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── UserCard.test.tsx
│   │   │   │   └── UserCard.tsx
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── .eslintrc.js
│   │   ├── env.d.ts
│   │   ├── jest.config.js
│   │   ├── jest.setup.js
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── server/                  # Express.js backend server
│   │   ├── src/
│   │   │   ├── __tests__/
│   │   │   │   └── index.test.ts
│   │   │   └── index.ts
│   │   ├── .eslintrc.js
│   │   ├── env.d.ts
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── database/                # Database migrations and seeds
│       ├── .eslintrc.js
│       ├── package.json
│       ├── README.md
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                  # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── user.test.ts
│   │   │   │   └── index.ts      # Exports User type
│   │   │   └── index.ts
│   │   ├── .eslintrc.js
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── eslint-config-custom/    # Shared ESLint configurations
│   │   ├── index.js             # Base ESLint config
│   │   ├── react.js             # React-specific config
│   │   └── package.json
│   │
│   └── tsconfig/                # Shared TypeScript configurations
│       ├── base.json
│       ├── nextjs.json
│       ├── node.json
│       ├── react-library.json
│       └── package.json
│
├── .editorconfig
├── .eslintignore
├── .eslintrc.js
├── .gitattributes
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc.js
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── PROJECT_STRUCTURE.md
├── README.md
├── package.json
├── tsconfig.base.json
└── turbo.json
```

## Path Aliases

### Global
- `@application/shared` → `packages/shared/src`
- `@application/types` → `packages/shared/src/types`

### client-web
- `@application/components/*` → `apps/client-web/src/components/*`
- `@application/lib/*` → `apps/client-web/src/lib/*`
- `@application/styles/*` → `apps/client-web/src/styles/*`

### server
- `@application/controllers/*` → `apps/server/src/controllers/*`
- `@application/routes/*` → `apps/server/src/routes/*`
- `@application/middleware/*` → `apps/server/src/middleware/*`
- `@application/utils/*` → `apps/server/src/utils/*`

### database
- `@application/migrations/*` → `apps/database/src/migrations/*`
- `@application/seeds/*` → `apps/database/src/seeds/*`

## Quick Commands

```bash
# Install all dependencies
npm install

# Run all apps in development
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Lint all code
npm run lint

# Format all code
npm run format
```

## Environment Variables

### client-web
Create `apps/client-web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

### server
Create `apps/server/.env`:
```
PORT=3001
NODE_ENV=development
```

