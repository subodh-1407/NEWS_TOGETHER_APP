import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './AuthContext';
import { API_BASE_URL } from './config/api';

jest.mock('axios', () => ({ __esModule: true, default: { post: jest.fn(), interceptors: { response: { use: jest.fn(), eject: jest.fn() } } } }));
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

function tokenWithExpiration(milliseconds) {
 return ['eyJhbGciOiJIUzI1NiJ9', btoa(JSON.stringify({id:'reader',exp:Math.floor(milliseconds/1000)})), 'test-signature'].join('.');
}
const sessionToken = tokenWithExpiration(Date.now()+3600000);
afterEach(()=>{jest.useRealTimers();});

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  jest.clearAllMocks();
});
function mount() { return render(<AuthProvider><App /></AuthProvider>); }

test('successful login opens the news page immediately without a refresh', async () => {
  axios.post.mockResolvedValueOnce({ data: { token: sessionToken } });
  const { container } = mount();
  const form = container.querySelector('.sign-in form');
  fireEvent.change(within(form).getByPlaceholderText('Email'), { target: { value: 'reader@example.com' } });
  fireEvent.change(within(form).getByPlaceholderText('Password'), { target: { value: 'test-password' } });
  fireEvent.submit(form);
  expect(await screen.findByRole('heading', { name: 'News home' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/home');
  expect(localStorage.getItem('token')).toBe(sessionToken);
  expect(container.querySelector('.sign-in form')).toBeNull();
  fireEvent.click(screen.getByRole('link', { name: 'NewTogether home' }));
  expect(screen.getByRole('heading', { name: 'News home' })).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBe(sessionToken);
  fireEvent.click(screen.getByRole('button', { name: /log out/i }));
  expect(container.querySelector('.sign-in form')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'News home' })).not.toBeInTheDocument();
  expect(localStorage.getItem('token')).toBeNull();
});

test('an existing session at the root opens home instead of the login page', async () => {
  localStorage.setItem('token', sessionToken);
  const { container } = mount();
  expect(await screen.findByRole('heading', { name: 'News home' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/home');
  expect(container.querySelector('.sign-in form')).toBeNull();
});


test('navbar links include their padded area and underline in the navigation target', async () => {
  localStorage.setItem('token', sessionToken);
  mount();
  await screen.findByRole('heading', { name: 'News home' });
  const search = screen.getByRole('link', { name: 'Search' });
  expect(search).toHaveClass('block', 'py-7');
  const underline = search.querySelector('span[aria-hidden="true"]');
  expect(underline).not.toBeNull();
  fireEvent.click(underline);
  expect(window.location.pathname).toBe('/search');
  expect(localStorage.getItem('token')).toBe(sessionToken);
});


test('mobile navigation opens, closes with Escape, and closes after selecting a link', async () => {
 localStorage.setItem('token',sessionToken);mount();await screen.findByRole('heading',{name:'News home'});
 const button=screen.getByRole('button',{name:'Open navigation'});expect(button).toHaveAttribute('aria-expanded','false');
 fireEvent.click(button);expect(screen.getByRole('button',{name:'Close navigation'})).toHaveAttribute('aria-expanded','true');
 expect(document.getElementById('primary-navigation')).toHaveClass('is-open');
 fireEvent.keyDown(document,{key:'Escape'});expect(screen.getByRole('button',{name:'Open navigation'})).toHaveAttribute('aria-expanded','false');
 fireEvent.click(screen.getByRole('button',{name:'Open navigation'}));fireEvent.click(screen.getByRole('link',{name:'Home',exact:true}));
 expect(screen.getByRole('button',{name:'Open navigation'})).toHaveAttribute('aria-expanded','false');
});

test('login and signup can be switched and password visibility never submits the form', () => {
 const {container}=mount();const form=container.querySelector('.sign-in form');
 fireEvent.click(within(form).getByRole('button',{name:'Show password'}));expect(within(form).getByPlaceholderText('Password')).toHaveAttribute('type','text');expect(axios.post).not.toHaveBeenCalled();
 fireEvent.click(container.querySelector('#register'));expect(container.querySelector('#container2')).toHaveClass('active');
 fireEvent.click(container.querySelector('#login'));expect(container.querySelector('#container2')).not.toHaveClass('active');
});


test('an expired stored token redirects a protected URL to login without showing news', () => {
 window.history.replaceState({},'', '/favourite');
 localStorage.setItem('token',tokenWithExpiration(Date.now()-1000));
 const {container}=mount();
 expect(container.querySelector('.sign-in form')).toBeInTheDocument();
 expect(screen.queryByRole('heading',{name:'News home'})).not.toBeInTheDocument();
 expect(localStorage.getItem('token')).toBeNull();expect(window.location.pathname).toBe('/');
});

test('a token expires automatically while the news page stays open', () => {
 jest.useFakeTimers('modern');jest.setSystemTime(Date.now());
 localStorage.setItem('token',tokenWithExpiration(Date.now()+2000));
 window.history.replaceState({},'', '/home');const {container}=mount();
 expect(screen.getByRole('heading',{name:'News home'})).toBeInTheDocument();
 act(()=>{jest.advanceTimersByTime(2100);});
 expect(container.querySelector('.sign-in form')).toBeInTheDocument();
 expect(localStorage.getItem('token')).toBeNull();expect(window.location.pathname).toBe('/');
});

test('resuming a sleeping tab checks expiration immediately', () => {
 jest.useFakeTimers('modern');const now=Date.now();jest.setSystemTime(now);
 localStorage.setItem('token',tokenWithExpiration(now+2000));
 window.history.replaceState({},'', '/home');const {container}=mount();
 jest.setSystemTime(now+3000);fireEvent.focus(window);
 expect(container.querySelector('.sign-in form')).toBeInTheDocument();expect(window.location.pathname).toBe('/');
});

test('a server 401 for the current session redirects to login', async () => {
 localStorage.setItem('token',sessionToken);window.history.replaceState({},'', '/home');const {container}=mount();
 const rejected=axios.interceptors.response.use.mock.calls[0][1];
 await act(async()=>{await rejected({response:{status:401},config:{url:API_BASE_URL+'/getAllBookmarkedNews',headers:{Authorization:'Bearer '+sessionToken}}}).catch(()=>{});});
 expect(container.querySelector('.sign-in form')).toBeInTheDocument();expect(localStorage.getItem('token')).toBeNull();expect(window.location.pathname).toBe('/');
});

test('unrelated provider and failed login responses do not sign out a valid session', async () => {
 localStorage.setItem('token',sessionToken);mount();const rejected=axios.interceptors.response.use.mock.calls[0][1];
 for(const url of ['https://newsdata.io/api/1/latest',API_BASE_URL+'/login']) {
  await act(async()=>{await rejected({response:{status:401},config:{url,headers:{Authorization:'Bearer '+sessionToken}}}).catch(()=>{});});
 }
 expect(screen.getByRole('heading',{name:'News home'})).toBeInTheDocument();expect(localStorage.getItem('token')).toBe(sessionToken);
});

test('a late 401 for an older token cannot clear a newer login', async () => {
 localStorage.setItem('token',sessionToken);mount();const rejected=axios.interceptors.response.use.mock.calls[0][1];
 const newer=tokenWithExpiration(Date.now()+7200000);localStorage.setItem('token',newer);
 await act(async()=>{await rejected({response:{status:401},config:{url:API_BASE_URL+'/getAllBookmarkedNews',headers:{Authorization:'Bearer '+sessionToken}}}).catch(()=>{});});
 expect(localStorage.getItem('token')).toBe(newer);expect(screen.getByRole('heading',{name:'News home'})).toBeInTheDocument();
});

test('logout in another tab updates the open page', () => {
 localStorage.setItem('token',sessionToken);const {container}=mount();localStorage.removeItem('token');
 fireEvent(window,new StorageEvent('storage',{key:'token',newValue:null}));
 expect(container.querySelector('.sign-in form')).toBeInTheDocument();expect(window.location.pathname).toBe('/');
});

test('malformed tokens cannot open a protected page', () => {
 localStorage.setItem('token','invalid-token');window.history.replaceState({},'', '/home');const {container}=mount();
 expect(container.querySelector('.sign-in form')).toBeInTheDocument();expect(window.location.pathname).toBe('/');
});
