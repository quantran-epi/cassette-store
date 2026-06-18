import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('idb-keyval', () => ({
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve()),
  del: jest.fn(() => Promise.resolve()),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id'),
}));

beforeEach(() => {
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

  window.history.pushState({}, '', '/cassette-store/');
  global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
  } as Response));
});

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

test('renders cassette store app shell', async () => {
  render(<App />);
  expect(await screen.findByText(/Home/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Đơn hàng/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Khách hàng/i).length).toBeGreaterThan(0);
});
