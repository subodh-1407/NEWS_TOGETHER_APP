import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { Toaster } from 'react-hot-toast';
import useBookmarks from '../hooks/useBookmarks';
import defaultImage from '../news-notdefined.jpeg';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeContext } from './ThemeContext';



const Search = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(location.search).get('q') || '');
  const [selectedNews, setSelectedNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(Boolean(searchQuery));
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [retry,setRetry] = useState(0);
  const { likedArticles, toggleBookmark: clickHandler } = useBookmarks();
  const { theme } = useContext(ThemeContext);
  const fetchSearchData = useCallback(async (query,page,signal) => {
    setLoading(true);setError('');
    try {
      const params = new URLSearchParams({page:String(page),pageSize:'6'});
      if(query.trim())params.set('q',query.trim());else params.set('category','general');
      const {data} = await axios.get(API_BASE_URL + (query.trim()?'/search?':'/news?') + params,{timeout:15000,signal});
      if(data.status==='error' || !Array.isArray(data.articles))throw new Error(data.message || 'Unable to load news.');
      if(!signal.aborted){setSelectedNews(data.articles);setTotalPages(Math.max(1,Math.ceil(data.totalResults/6)));}
    } catch(error) {
      if(!signal.aborted){setError(error.response?.data?.message || error.message || 'Unable to load news.');setSelectedNews([]);setTotalPages(1);}
    } finally {if(!signal.aborted)setLoading(false);}
  },[]);
  useEffect(()=>{const q=new URLSearchParams(location.search).get('q') || '';setSearchQuery(q);setIsSearching(Boolean(q));setCurrentPage(1);},[location.search]);
  useEffect(()=>{
    const controller=new AbortController();const timer=setTimeout(()=>fetchSearchData(searchQuery,currentPage,controller.signal),searchQuery?400:0);
    return()=>{clearTimeout(timer);controller.abort();};
  },[searchQuery,currentPage,retry,fetchSearchData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value.length > 0);
    setCurrentPage(1);
  };

  const renderNewsCards = (news) => {
    if (!news || news.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, index) => (
          <div key={index} className={`rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 relative ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <div className='w-[40px] h-[40px] bg-black shadow-lg rounded-full absolute right-3 top-3 grid place-items-center'>
              <button onClick={() => clickHandler(article)}>
                {likedArticles.some((a) => a.url === article.url) ? (
                  <FcLike fontSize="1.75rem" />
                ) : (
                  <FcLikePlaceholder fontSize="1.75rem" />
                )}
              </button>
            </div>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img
                src={article.urlToImage || defaultImage}
                alt={article.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <div className="p-4">
                <p className="font-semibold text-lg leading-6">{article.title}</p>
                <p className="mt-2">
                  {article.description ? (
                    article.description.length > 100 ?
                      `${article.description.substr(0, 100)}...` :
                      article.description
                  ) : 'No description available.'}
                </p>
              </div>
              <p className="text-sm">{new Date(article.publishedAt).toLocaleDateString()}</p>
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`search-page ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Navbar />
      <div className="w-full h-full px-4 sm:px-10 lg:px-32 py-14">
        <Toaster />

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search news..."
            className={`p-3 pl-10 w-full sm:w-2/3 lg:w-1/2 rounded-full shadow-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-black text-white placeholder-gray-400 border-gray-600' : 'bg-white text-black placeholder-gray-600 border-gray-300'}`}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Selected News Section */}
        {loading && <p role="status" className="text-center py-8">Loading news...</p>}
        {error && <div className="news-error" role="alert"><p>{error}</p><button className="news-retry bg-blue-600 rounded-md" onClick={()=>setRetry(value=>value+1)}>Try again</button></div>}
        {!loading && !error && selectedNews.length===0 && <p className="text-center py-8">No articles found. Try another search.</p>}
        {!loading && !error && selectedNews.length > 0 && (
          <div id="selectedNews" className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-6">{isSearching ? 'Search Results' : 'Top Headlines'}</h2>
            {renderNewsCards(selectedNews)}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4">
            <button
              className={`px-4 py-2 text-white rounded-full transition-opacity ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-700 hover:bg-blue-600'} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={loading || currentPage === 1}
            >
              Previous
            </button>
            <button
              className={`px-4 py-2 text-white rounded-full transition-opacity ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-700 hover:bg-blue-600'} ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={loading || currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Search;
