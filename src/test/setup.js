import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  window.api = {
    storage: { load: vi.fn(), save: vi.fn() },
    blocker: { start: vi.fn(), stop: vi.fn() },
    gemini: { generate: vi.fn() }
  };
}
