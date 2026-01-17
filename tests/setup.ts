// Jest setup file
import { TextEncoder, TextDecoder } from 'util';

// Global test setup
global.TextEncoder = TextEncoder as never;
global.TextDecoder = TextDecoder as never;

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
