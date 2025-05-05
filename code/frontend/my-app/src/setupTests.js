// Jest setup file
require('@testing-library/jest-dom');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock SpeechSynthesis
const mockSpeechSynthesis = {
  speaking: false,
  paused: false,
  pending: false,
  onvoiceschanged: null,
  getVoices: jest.fn().mockReturnValue([]),
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
});