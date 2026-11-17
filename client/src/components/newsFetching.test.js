import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Main from './Main';
import Dashboard from './Dashboard';
import Search from './Search';
import { ThemeContext } from './ThemeContext';

jest.mock('axios',()=>({__esModule:true,default:{get:jest.fn()}}));
jest.mock('../hooks/useBookmarks',()=>({__esModule:true,default:()=>({likedArticles:[],toggleBookmark:jest.fn()})}));
jest.mock('./Navbar',()=>()=>null);
jest.mock('./Footer',()=>()=>null);
jest.mock('react-hot-toast',()=>({__esModule:true,default:{success:jest.fn(),error:jest.fn()},Toaster:()=>null}));
const base=process.env.REACT_APP_API_URL || 'https://news-together-app.onrender.com';
const story={title:'Provider story',description:'Current reporting.',url:'https://publisher.example/story',urlToImage:'https://publisher.example/image.jpg',publishedAt:'2026-11-17T08:00:00Z'};
beforeEach(()=>{jest.clearAllMocks();axios.get.mockResolvedValue({status:200,data:{articles:[story],totalResults:1}});});
function mount(component,path='/'){return render(<ThemeContext.Provider value={{theme:'light'}}><MemoryRouter initialEntries={[path]}>{component}</MemoryRouter></ThemeContext.Provider>);}

test('hero retains its original production news URL and timeout',async()=>{
 const {container}=mount(<Main/>);
 await waitFor(()=>expect(container.querySelector('section').style.backgroundImage).toContain(story.urlToImage));
 expect(axios.get).toHaveBeenCalledWith(base+'/api/v1/news?category=general&pageSize=10',{timeout:10000});
});
test('dashboard retains its original production headlines request',async()=>{
 mount(<Dashboard/>);await screen.findByText(story.title);
 expect(axios.get).toHaveBeenCalledWith(base+'/api/v1/news?category=general&page=1&pageSize=6',expect.objectContaining({timeout:15000}));
});
test('search retains its original production search URL and timeout',async()=>{
 mount(<Search/>,'/search?q=space');await screen.findByText(story.title);
 expect(axios.get).toHaveBeenCalledWith(base+'/api/v1/search?q=space&page=1&pageSize=6',{timeout:10000});
});
