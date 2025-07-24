# SaaS UI Pro Development Guidelines

## Project Overview

This document outlines the development guidelines and best practices for the SaaS UI Pro monorepo. Our goal is to maintain a high-quality, scalable, and maintainable codebase that delivers exceptional user experiences while ensuring consistency across all packages and applications.

## Core Goals & Philosophy

### 🎯 SaaS UI Pro Core Goals
🚀 **Developer Experience**: Provide exceptional DX with TypeScript, modern tooling, and clear patterns
🎨 **Design System Consistency**: Maintain visual and behavioral consistency across all components
📦 **Modular Architecture**: Enable selective package usage and tree-shaking optimization
⚡ **Performance First**: Optimize for bundle size, runtime performance, and user experience
🔧 **Framework Agnostic**: Support multiple frameworks while maintaining React as primary target
🌐 **Accessibility**: WCAG 2.1 AA compliance across all components and features

### 📋 Development Priorities (in order)
1. **Type Safety & Developer Experience** - Comprehensive TypeScript coverage and excellent IntelliSense
2. **Component API Consistency** - Predictable patterns across all components and packages
3. **Performance Optimization** - Bundle size, runtime performance, and loading times
4. **Accessibility Compliance** - Universal design principles and WCAG standards
5. **Testing Coverage** - Unit, integration, and visual regression testing
6. **Documentation Quality** - Clear examples, API docs, and usage guidelines

### 🧭 Implementation Philosophy
- **TypeScript First** - All code must be written in TypeScript with strict type checking
- **Component Composition** - Favor composition over inheritance and complex prop APIs
- **Performance by Default** - Optimize for tree-shaking, lazy loading, and minimal bundle impact
- **Accessibility by Design** - Build accessibility into components from the ground up
- **Developer Ergonomics** - Prioritize clear APIs and excellent developer experience

## 🏗️ Project Architecture

The project follows a monorepo structure with clear separation between packages, applications, and shared tooling, ensuring scalability and maintainability across the entire ecosystem.

### Repository Structure

```
saas-ui-pro/
├── apps/                          # Applications
│   ├── demo/                      # Main demo application which can be accorded
│   ├── desktop/                   # Desktop application
│   └── EZWorking/               # My project EZWorking
├── packages/                      # Reusable packages
│   ├── react/                     # Core React components
│   ├── billing/                   # Billing components
│   ├── onboarding/               # Onboarding flows
│   ├── feature-flags/            # Feature flag system
│   ├── kanban/                   # Kanban components
│   └── [other-packages]/        # Additional packages
├── turbo.json                    # Turbo build configuration
├── package.json                  # Root package configuration
└── tsconfig.base.json           # Base TypeScript configuration
```

### Technology Stack

#### Core Technologies
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5.6+ with strict mode
- **UI Library**: Chakra UI v2 with custom theme system
- **State Management**: TanStack Query for server state, React Context for client state
- **Styling**: Emotion with Chakra UI theme system
- **Build Tool**: Turbo for monorepo builds
- **Package Manager**: Yarn 4+ with workspaces

#### Development Tools
- **Linting**: ESLint with TypeScript and React plugins
- **Formatting**: Prettier with import sorting
- **Type Checking**: TypeScript compiler with strict settings
- **Testing**: Jest + React Testing Library (when implemented)
- **Git Hooks**: Husky with lint-staged for pre-commit checks

## 📁 Application Structure (apps/demo)

### Directory Organization

```
apps/demo/src/
├── api/                          # API layer and data fetching
│   ├── types.ts                  # Shared API types
│   ├── [resource].ts            # Resource-specific API functions
│   └── index.ts                 # API exports
├── app/                         # Next.js App Router pages
│   ├── (auth)/                  # Authentication routes
│   ├── (dashboard)/             # Dashboard routes
│   ├── layout.tsx               # Root layout
│   └── provider.tsx             # Root context provider
├── components/                  # Reusable UI components
│   ├── [component-name]/        # Component directory
│   │   ├── index.ts            # Component exports
│   │   ├── [component].tsx     # Main component
│   │   └── [component].test.tsx # Component tests
│   └── index.ts                # Component barrel exports
├── features/                    # Feature-based modules
│   ├── [feature-name]/         # Feature directory
│   │   ├── components/         # Feature-specific components
│   │   ├── hooks/              # Feature-specific hooks
│   │   ├── providers/          # Feature context providers
│   │   └── index.ts           # Feature exports
├── config/                     # Configuration files
├── lib/                        # Utility functions and helpers
├── theme/                      # Chakra UI theme customization
├── types/                      # Global type definitions
└── i18n/                      # Internationalization
```

### File Naming Conventions

#### Components
```typescript
// ✅ Component files - PascalCase
components/UserProfile/UserProfile.tsx
components/UserProfile/index.ts

// ✅ Hook files - camelCase with 'use' prefix
hooks/useUserProfile.ts
hooks/useApiQuery.ts

// ✅ Utility files - camelCase
lib/formatDate.ts
lib/apiClient.ts

// ✅ Type files - camelCase with .d.ts or types suffix
types/user.ts
types/api.d.ts
```

#### Pages and Routes
```typescript
// ✅ Next.js App Router - kebab-case for routes
app/(dashboard)/user-settings/page.tsx
app/(auth)/sign-in/page.tsx

// ✅ Feature modules - kebab-case directories
features/user-management/
features/billing-dashboard/
```

## 🎨 Component Development Guidelines

### Component Structure

```typescript
// ✅ Standard component structure
import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'

export interface UserCardProps extends BoxProps {
  /** User data object */
  user: User
  /** Show user avatar */
  showAvatar?: boolean
  /** Click handler for user interaction */
  onUserClick?: (user: User) => void
}

/**
 * UserCard component displays user information in a card format
 * 
 * @example
 * ```tsx
 * <UserCard 
 *   user={userData} 
 *   showAvatar 
 *   onUserClick={handleUserClick} 
 * />
 * ```
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  showAvatar = true,
  onUserClick,
  ...boxProps
}) => {
  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      cursor={onUserClick ? 'pointer' : 'default'}
      onClick={() => onUserClick?.(user)}
      {...boxProps}
    >
      {/* Component implementation */}
    </Box>
  )
}

// ✅ Default export for easier imports
export default UserCard
```

### TypeScript Guidelines

#### Interface Definitions
```typescript
// ✅ Extend base component props when possible
interface ButtonProps extends ChakraButtonProps {
  /** Loading state indicator */
  isLoading?: boolean
  /** Icon to display before text */
  leftIcon?: React.ReactElement
}

// ✅ Use discriminated unions for variant props
interface AlertProps {
  status: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
}

// ✅ Generic types for reusable components
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
}
```

#### Type Safety Best Practices
```typescript
// ✅ Use const assertions for immutable data
const STATUSES = ['active', 'inactive', 'pending'] as const
type Status = typeof STATUSES[number]

// ✅ Strict event handler typing
interface FormProps {
  onSubmit: (data: FormData) => void | Promise<void>
  onError?: (error: Error) => void
}

// ✅ Proper generic constraints
interface ApiResponse<T extends Record<string, unknown>> {
  data: T
  status: number
  message: string
}
```

### Styling Guidelines

#### Chakra UI Integration
```typescript
// ✅ Use Chakra UI props for styling
<Box
  bg="gray.50"
  p={4}
  borderRadius="md"
  _hover={{ bg: 'gray.100' }}
  _dark={{ bg: 'gray.800', _hover: { bg: 'gray.700' } }}
>
  Content
</Box>

// ✅ Create custom theme tokens
// theme/foundations/colors.ts
export const colors = {
  brand: {
    50: '#f0f9ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
}

// ✅ Use semantic tokens for consistency
<Button colorScheme="brand" variant="solid">
  Primary Action
</Button>
```

#### Responsive Design
```typescript
// ✅ Mobile-first responsive design
<Stack
  direction={{ base: 'column', md: 'row' }}
  spacing={{ base: 4, md: 8 }}
  align={{ base: 'stretch', md: 'center' }}
>
  <Box flex={1}>Content</Box>
</Stack>

// ✅ Use breakpoint objects consistently
const responsiveProps = {
  fontSize: { base: 'sm', md: 'md', lg: 'lg' },
  p: { base: 4, md: 6, lg: 8 },
}
```

## 🔧 Development Workflow

### Package Development

#### Creating New Packages
```bash
# ✅ Use consistent package structure
packages/new-feature/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### Package Configuration
```json
// ✅ Standard package.json structure
{
  "name": "@saas-ui-pro/new-feature",
  "version": "0.1.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=18.0.0",
    "@chakra-ui/react": ">=2.0.0"
  }
}
```

### Code Quality Standards

#### ESLint Configuration
```javascript
// ✅ Strict linting rules
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/prop-types': 'off', // Using TypeScript
    'react/react-in-jsx-scope': 'off', // Next.js handles this
  }
}
```

#### Import Organization
```typescript
// ✅ Import order (enforced by prettier plugin)
// 1. React and framework imports
import React from 'react'
import { NextPage } from 'next'

// 2. Third-party libraries
import { Box, Button } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

// 3. Internal packages
import { UserCard } from '@saas-ui-pro/react'

// 4. Relative imports
import { useUserData } from '../hooks/useUserData'
import { UserType } from './types'
```

### Testing Strategy

#### Component Testing
```typescript
// ✅ Comprehensive component tests
import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { UserCard } from './UserCard'

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>{component}</ChakraProvider>
  )
}

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  }

  it('renders user information correctly', () => {
    renderWithChakra(<UserCard user={mockUser} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('calls onUserClick when clicked', () => {
    const handleClick = jest.fn()
    renderWithChakra(
      <UserCard user={mockUser} onUserClick={handleClick} />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(mockUser)
  })
})
```

## 🚀 Performance Guidelines

### Bundle Optimization

#### Tree Shaking
```typescript
// ✅ Named exports for tree shaking
export { UserCard } from './UserCard'
export { UserList } from './UserList'
export type { UserCardProps, UserListProps } from './types'

// ❌ Avoid default exports for libraries
export default { UserCard, UserList } // Prevents tree shaking
```

#### Code Splitting
```typescript
// ✅ Dynamic imports for large components
const HeavyChart = React.lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart data={chartData} />
    </Suspense>
  )
}

// ✅ Route-based code splitting (Next.js handles this)
// app/dashboard/analytics/page.tsx - automatically split
```

### Runtime Performance

#### Memoization
```typescript
// ✅ Memoize expensive calculations
const ExpensiveComponent: React.FC<Props> = ({ data, filters }) => {
  const processedData = useMemo(() => {
    return data.filter(filters).map(transformData)
  }, [data, filters])

  return <DataTable data={processedData} />
}

// ✅ Memoize callback functions
const UserList: React.FC<Props> = ({ users, onUserSelect }) => {
  const handleUserClick = useCallback((user: User) => {
    onUserSelect(user)
  }, [onUserSelect])

  return (
    <>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={handleUserClick} 
        />
      ))}
    </>
  )
}
```

## 🛡️ Security Guidelines

### Input Validation
```typescript
// ✅ Validate all user inputs
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150)
})

function validateUser(data: unknown): User {
  return UserSchema.parse(data)
}
```

### API Security
```typescript
// ✅ Secure API calls
async function fetchUserData(userId: string): Promise<User> {
  // Validate input
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID')
  }

  const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`)
  }

  return response.json()
}
```

## ♿ Accessibility Guidelines

### WCAG Compliance
```typescript
// ✅ Proper ARIA labels and roles
<Button
  aria-label="Delete user account"
  aria-describedby="delete-warning"
  onClick={handleDelete}
>
  <DeleteIcon />
</Button>
<Text id="delete-warning" fontSize="sm" color="red.500">
  This action cannot be undone
</Text>

// ✅ Keyboard navigation support
<Box
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  onClick={handleClick}
>
  Interactive element
</Box>
```

### Focus Management
```typescript
// ✅ Proper focus management
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const initialFocusRef = useRef<HTMLButtonElement>(null)
  
  return (
    <ChakraModal 
      isOpen={isOpen} 
      onClose={onClose}
      initialFocusRef={initialFocusRef}
    >
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button ref={initialFocusRef} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  )
}
```

## 📚 Documentation Standards

### Component Documentation
```typescript
/**
 * UserCard displays user information in a card format with optional actions
 * 
 * @example
 * Basic usage:
 * ```tsx
 * <UserCard user={userData} />
 * ```
 * 
 * @example
 * With actions:
 * ```tsx
 * <UserCard 
 *   user={userData}
 *   showActions
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export interface UserCardProps {
  /** User data to display */
  user: User
  /** Whether to show action buttons */
  showActions?: boolean
  /** Callback when edit button is clicked */
  onEdit?: (user: User) => void
  /** Callback when delete button is clicked */
  onDelete?: (user: User) => void
}
```

### README Structure
```markdown
# Package Name

Brief description of the package and its purpose.

## Installation

```bash
npm install @saas-ui-pro/package-name
```

## Usage

```tsx
import { Component } from '@saas-ui-pro/package-name'

function App() {
  return <Component prop="value" />
}
```

## API Reference

### Component

Description of the component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop | string | - | Description |

## Examples

[Link to Storybook or demo]
```

## ❌ Anti-Patterns to Avoid

### Component Design
```typescript
// ❌ Overly complex prop APIs
interface BadComponentProps {
  showHeaderWithIconAndTooltip?: boolean
  headerIconColorWhenHovered?: string
  enableAdvancedFeatureSet?: boolean
}

// ✅ Compose smaller components instead
<Card>
  <CardHeader>
    <Icon name="user" />
    <Tooltip label="User information">
      <Text>User Details</Text>
    </Tooltip>
  </CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

### State Management
```typescript
// ❌ Prop drilling
function App() {
  const [user, setUser] = useState()
  return <DeepChild user={user} setUser={setUser} />
}

// ✅ Use context for shared state
const UserContext = createContext<UserContextType>()

function App() {
  return (
    <UserProvider>
      <DeepChild />
    </UserProvider>
  )
}
```

### Performance
```typescript
// ❌ Creating objects in render
function Component({ items }) {
  return (
    <List>
      {items.map(item => (
        <ListItem 
          key={item.id}
          style={{ color: 'red' }} // New object every render
          onClick={() => handleClick(item)} // New function every render
        />
      ))}
    </List>
  )
}

// ✅ Memoize objects and callbacks
const itemStyle = { color: 'red' }

function Component({ items }) {
  const handleClick = useCallback((item) => {
    // Handle click
  }, [])

  return (
    <List>
      {items.map(item => (
        <ListItem 
          key={item.id}
          style={itemStyle}
          onClick={() => handleClick(item)}
        />
      ))}
    </List>
  )
}
```

## ✅ Success Criteria

### 🎯 Primary Goals (Must Achieve)
- 🚀 **Developer Experience**: Excellent TypeScript support, clear APIs, comprehensive documentation
- 🎨 **Design Consistency**: Unified visual language across all components and applications
- 📦 **Modular Architecture**: Clean package boundaries with minimal dependencies
- ⚡ **Performance**: Fast bundle sizes, efficient runtime performance, optimal loading
- 🛡️ **Production Quality**: Comprehensive error handling, testing, and monitoring
- ♿ **Accessibility**: WCAG 2.1 AA compliance across all components

### 🚀 Quality Metrics (Secondary)
- 🏎️ **Build Performance**: Fast development builds and optimized production bundles
- 💾 **Bundle Efficiency**: Tree-shakeable exports and minimal runtime overhead
- 🔧 **Tooling Integration**: Seamless integration with popular development tools
- 🌐 **Cross-Platform**: Consistent behavior across different browsers and devices

### 📈 Success Indicators
- ✅ **Zero TypeScript Errors**: Strict type checking with no any types
- ✅ **100% Component Coverage**: All components have proper TypeScript interfaces
- ✅ **Accessibility Compliance**: All components pass accessibility audits
- ✅ **Performance Budgets**: Bundle size and runtime performance within targets
- ✅ **Developer Satisfaction**: Positive feedback on API design and documentation

## 🔑 Key Implementation Principles

**Maintain consistency with established patterns while continuously improving developer experience and performance. The SaaS UI Pro ecosystem should feel cohesive and predictable, enabling developers to build exceptional applications efficiently.**

Key advantages of our approach:
- **TypeScript-first development** for excellent developer experience and runtime safety
- **Component composition patterns** for flexible and maintainable UI construction
- **Performance optimization** through tree-shaking, code splitting, and efficient rendering
- **Accessibility by design** ensuring inclusive user experiences
- **Comprehensive testing** for reliability and regression prevention
- **Clear documentation** for easy adoption and contribution

The goal is to create the most developer-friendly and performant React component library for SaaS applications, setting new standards for design system quality and usability.