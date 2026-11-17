import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL as BASE_URL } from '../config/api';

function requestOptions() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Please sign in to manage favourites.');
  // Use the current login token consistently, rather than a possibly older cookie.
  return { headers: { Authorization: 'Bearer ' + token } };
}
async function fetchBookmarks() {
  const { data } = await axios.get(BASE_URL + '/getAllBookmarkedNews', requestOptions());
  if (data.success === false) throw new Error(data.message || 'Unable to load favourites.');
  return (Array.isArray(data.bookmarkedNews) ? data.bookmarkedNews : []).filter(article => article && article._id && article.url);
}

export default function useBookmarks() {
  const [likedArticles, setLikedArticles] = useState([]);
  const pending = useRef(new Set());
  const mounted = useRef(false);
  const revision = useRef(0);
  useEffect(() => {
    mounted.current = true;
    // Legacy cache entries may have no ID, deleted IDs, or belong to a previous login.
    localStorage.removeItem('likedArticles');
    const startedAt = revision.current;
    if (localStorage.getItem('token')) fetchBookmarks().then(articles => {
      if (mounted.current && startedAt === revision.current) setLikedArticles(articles);
    }).catch(error => {
      if (mounted.current) toast.error(error.response?.data?.message || error.message || 'Unable to load favourites.');
    });
    return () => { mounted.current = false; };
  }, []);

  const updateBookmark = useCallback(async (article, removeOnly = false) => {
    if (!article?.url || pending.current.has(article.url)) return;
    pending.current.add(article.url);
    revision.current++;
    const wasSaved = likedArticles.some(item => item.url === article.url);
    try {
      // Resolve the actual database ID by URL; never delete using a cached/news-provider ID.
      const current = await fetchBookmarks();
      const existing = current.find(item => item.url === article.url);
      if (existing) {
        try {
          await axios.delete(BASE_URL + '/deleteBookmarkedNews/' + existing._id, requestOptions());
        } catch (error) {
          // A second tab may already have removed it. Only accept 404 if the server confirms absence.
          if (error.response?.status !== 404) throw error;
          const latest = await fetchBookmarks();
          if (latest.some(item => item.url === article.url)) throw error;
        }
        if (mounted.current) setLikedArticles(await fetchBookmarks());
        toast.success('Removed from Favourites');
      } else if (removeOnly || wasSaved) {
        if (mounted.current) setLikedArticles(current);
        toast.success('Removed from Favourites');
      } else {
        const { data } = await axios.post(BASE_URL + '/addToBookmarkedNews', {
          ...article, urlToImage: article.urlToImage || article.image,
        }, requestOptions());
        if (data.success === false) throw new Error(data.message || 'Unable to save article.');
        const latest = await fetchBookmarks();
        if (!latest.some(item => item.url === article.url && item._id)) throw new Error('Unable to confirm the saved article. Please try again.');
        if (mounted.current) setLikedArticles(latest);
        toast.success('Added to Favourites');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to update favourites.');
    } finally { pending.current.delete(article.url); }
  }, [likedArticles]);

  return { likedArticles, toggleBookmark: updateBookmark, removeBookmark: article => updateBookmark(article, true) };
}
