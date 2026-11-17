import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './AuthContext';

jest.mock('axios', () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));
jest.mock('./components/Home', () => {
  const Navbar = require('./components/Navbar').default;
  return function Home() { return <><Navbar /><h1>News home</h1></>; };
});
jest.mock('./components/Categories', () => () => null);
jest.mock('./components/Popular', () => () => null);
jest.mock('./components/Dashboard', () => () => null);
jest.mock('./components/Explore', () => () => null);
jest.mock('./components/Search', () => () => null);
jest.mock('./components/Favourite', () => () => null);
jest.mock('./components/Supp', () => () => null);
jest.mock('./components/Settings', () => () => null);

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  jest.clearAllMocks();
});
function mount() { return render(<AuthProvider><App /></AuthProvider>); }

test('successful login opens the news page immediately without a refresh', async () => {
  axios.post.mockResolvedValueOnce({ data: { token: 'test-session-token' } });
  const { container } = mount();
  const form = container.querySelector('.sign-in form');
  fireEvent.change(within(form).getByPlaceholderText('Email'), { target: { value: 'reader@example.com' } });
  fireEvent.change(within(form).getByPlaceholderText('Password'), { target: { value: 'test-password' } });
  fireEvent.submit(form);
  expect(await screen.findByRole('heading', { name: 'News home' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/home');
  expect(localStorage.getItem('token')).toBe('test-session-token');
  expect(container.querySelector('.sign-in form')).toBeNull();
  fireEvent.click(screen.getByRole('link', { name: 'NewTogether home' }));
  expect(screen.getByRole('heading', { name: 'News home' })).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBe('test-session-token');
  fireEvent.click(screen.getByRole('button', { name: /log out/i }));
  expect(container.querySelector('.sign-in form')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'News home' })).not.toBeInTheDocument();
  expect(localStorage.getItem('token')).toBeNull();
});

test('an existing session at the root opens home instead of the login page', async () => {
  localStorage.setItem('token', 'existing-session-token');
  const { container } = mount();
  expect(await screen.findByRole('heading', { name: 'News home' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/home');
  expect(container.querySelector('.sign-in form')).toBeNull();
});


test('navbar links include their padded area and underline in the navigation target', async () => {
  localStorage.setItem('token', 'existing-session-token');
  mount();
  await screen.findByRole('heading', { name: 'News home' });
  const search = screen.getByRole('link', { name: 'Search' });
  expect(search).toHaveClass('block', 'py-7');
  const underline = search.querySelector('span[aria-hidden="true"]');
  expect(underline).not.toBeNull();
  fireEvent.click(underline);
  expect(window.location.pathname).toBe('/search');
  expect(localStorage.getItem('token')).toBe('existing-session-token');
});
