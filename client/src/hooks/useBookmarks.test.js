import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useBookmarks from './useBookmarks';

jest.mock('axios', () => ({__esModule:true,default:{get:jest.fn(),post:jest.fn(),delete:jest.fn()}}));
jest.mock('react-hot-toast', () => ({__esModule:true,default:{success:jest.fn(),error:jest.fn()}}));
const article={title:'A news story',url:'https://publisher.example/story'};
const saved={...article,_id:'507f1f77bcf86cd799439011'};
const response=items=>({data:{success:true,bookmarkedNews:items}});
beforeEach(()=>{localStorage.clear();localStorage.setItem('token','current-session');jest.resetAllMocks();axios.delete.mockResolvedValue({data:{success:true}});});

test('replaces legacy entries without IDs with canonical server bookmarks',async()=>{
 localStorage.setItem('likedArticles',JSON.stringify([article]));axios.get.mockResolvedValue(response([saved]));
 const {result}=renderHook(()=>useBookmarks());
 await waitFor(()=>expect(result.current.likedArticles).toEqual([saved]));
 expect(localStorage.getItem('likedArticles')).toBeNull();
 await act(async()=>{await result.current.toggleBookmark(article);});
 expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/deleteBookmarkedNews/'+saved._id),expect.objectContaining({headers:{Authorization:'Bearer current-session'}}));
});

test('resolves a stale ID again by URL before deleting',async()=>{
 axios.get.mockResolvedValueOnce(response([{...saved,_id:'old-id'}])).mockResolvedValueOnce(response([saved])).mockResolvedValue(response([]));
 const {result}=renderHook(()=>useBookmarks());await waitFor(()=>expect(result.current.likedArticles).toHaveLength(1));
 await act(async()=>{await result.current.toggleBookmark(article);});
 expect(axios.delete.mock.calls[0][0]).toContain('/'+saved._id);expect(axios.delete.mock.calls[0][0]).not.toContain('old-id');expect(result.current.likedArticles).toEqual([]);
});

test('a bookmark removed elsewhere is reconciled without sending a stale DELETE or re-saving',async()=>{
 axios.get.mockResolvedValueOnce(response([saved])).mockResolvedValue(response([]));
 const {result}=renderHook(()=>useBookmarks());await waitFor(()=>expect(result.current.likedArticles).toHaveLength(1));
 await act(async()=>{await result.current.toggleBookmark(article);});
 expect(axios.delete).not.toHaveBeenCalled();expect(axios.post).not.toHaveBeenCalled();expect(result.current.likedArticles).toEqual([]);
});

test('saving always uses the server record rather than falling back to an article without an ID',async()=>{
 axios.get.mockResolvedValueOnce(response([])).mockResolvedValueOnce(response([])).mockResolvedValue(response([saved]));axios.post.mockResolvedValue({data:{success:true,savedArticle:saved}});
 const {result}=renderHook(()=>useBookmarks());await waitFor(()=>expect(axios.get).toHaveBeenCalledTimes(1));
 await act(async()=>{await result.current.toggleBookmark(article);});
 expect(result.current.likedArticles).toEqual([saved]);expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/addToBookmarkedNews'),expect.objectContaining({url:article.url}),expect.anything());
});

test('a concurrent deletion 404 is accepted only after the server confirms the article is absent',async()=>{
 axios.get.mockResolvedValueOnce(response([saved])).mockResolvedValueOnce(response([saved])).mockResolvedValue(response([]));axios.delete.mockRejectedValue({response:{status:404}});
 const {result}=renderHook(()=>useBookmarks());await waitFor(()=>expect(result.current.likedArticles).toHaveLength(1));
 await act(async()=>{await result.current.toggleBookmark(article);});
 expect(toast.error).not.toHaveBeenCalled();expect(result.current.likedArticles).toEqual([]);
});

test('a missing delete route is not mistaken for a successful removal',async()=>{
 axios.get.mockResolvedValue(response([saved]));axios.delete.mockRejectedValue({response:{status:404,data:{message:'Route not found'}}});
 const {result}=renderHook(()=>useBookmarks());await waitFor(()=>expect(result.current.likedArticles).toHaveLength(1));
 await act(async()=>{await result.current.toggleBookmark(article);});
 expect(toast.error).toHaveBeenCalledWith('Route not found');expect(result.current.likedArticles).toEqual([saved]);
});
