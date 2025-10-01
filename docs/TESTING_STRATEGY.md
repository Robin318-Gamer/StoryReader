# Testing Strategy

This document outlines the testing approach for the StoryReader project, following Test-Driven Development (TDD) principles.

---

## Overview

All features must be developed using TDD:
1. Write tests first (RED)
2. Implement minimal code to pass tests (GREEN)
3. Refactor while keeping tests green (REFACTOR)

---

## Testing Pyramid

```
        /\
       /E2E\       - Critical user flows (optional for POC)
      /------\
     /  INT   \    - API endpoints, data flows
    /----------\
   /   UNIT     \  - Components, hooks, utilities
  /--------------\
```

---

## Unit Tests (80% of tests)

### Components
- Test rendering with different props
- Test user interactions (clicks, inputs)
- Test conditional rendering
- Test error states

**Example:**
```typescript
describe('TextInput', () => {
  it('should render textarea with placeholder', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should call onChange when text is entered', () => {
    const handleChange = jest.fn();
    render(<TextInput onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledWith('Hello');
  });
});
```

### Hooks
- Test state changes
- Test side effects
- Test error handling

### Utilities
- Test input/output for all edge cases
- Test error conditions

---

## Integration Tests (15% of tests)

### API Endpoints
- Test request/response flow
- Test authentication
- Test error responses
- Test rate limiting

**Example:**
```typescript
describe('POST /api/tts', () => {
  it('should generate audio for valid request', async () => {
    const response = await request(app)
      .post('/api/tts')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ text: 'Hello', language: 'en-US' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('audioUrl');
  });

  it('should return 401 for unauthenticated request', async () => {
    const response = await request(app)
      .post('/api/tts')
      .send({ text: 'Hello', language: 'en-US' });
    
    expect(response.status).toBe(401);
  });
});
```

### Data Flows
- Test frontend → backend → database flows
- Test caching mechanisms

---

## E2E Tests (5% of tests - Optional for POC)

### Critical User Paths
- Login → Enter text → Generate audio → Play audio
- Upload file → Auto-detect language → Generate audio
- View history → Replay audio

---

## Coverage Requirements

- **Minimum Overall:** 80%
- **Components:** 85%
- **Hooks:** 90%
- **Utilities:** 95%
- **API Endpoints:** 85%

---

## Test Organization

```
/tests
  /unit
    /components
      TextInput.test.tsx
      LanguageSelector.test.tsx
    /hooks
      useAudioPlayer.test.ts
    /utils
      languageDetection.test.ts
  /integration
    /api
      tts.test.ts
      history.test.ts
  /e2e (optional)
    userFlow.test.ts
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- TextInput.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run only integration tests
npm test -- integration
```

---

## Mocking Strategy

### External APIs
- Mock Google Cloud TTS responses
- Mock Supabase calls
- Use fixtures for consistent test data

### Example:
```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({ data: mockUser }))
    }
  }))
}));
```

---

## Continuous Testing

- Tests run automatically on every commit (pre-commit hook)
- Tests run in CI/CD pipeline on every PR
- Failed tests block merges to main branch

---

## Best Practices

1. **Keep tests simple and readable**
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Avoid test interdependencies**
5. **Mock external dependencies**
6. **Update tests when requirements change**
7. **Review test coverage regularly**

---

_Last updated: 2025-10-01_
