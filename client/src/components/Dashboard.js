import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { Toaster } from 'react-hot-toast';
import useBookmarks from '../hooks/useBookmarks';
import defaultImage from '../news-notdefined.jpeg';
import { ThemeContext } from './ThemeContext';

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedNews, setSelectedNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { likedArticles, toggleBookmark: handleBookmark } = useBookmarks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  const PAGE_SIZE = 6;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {const params = new URLSearchParams({ page: String(currentPage), pageSize: String(PAGE_SIZE) });
        const searching = isSearching || selectedCategory === 'politics';
        if (searching) params.set('q', searchQuery || 'politics');
        else params.set('category', selectedCategory);
        const response = await axios.get(API_BASE_URL + (searching ? '/search?' : '/news?') + params, { timeout: 15000 });

        if (response.data && Array.isArray(response.data.articles)) {
          setSelectedNews(response.data.articles);
          setTotalPages(Math.ceil(response.data.totalResults / PAGE_SIZE));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
        setSelectedNews([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory, currentPage, searchQuery, isSearching]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(value.length > 0);
    setCurrentPage(1);
  };

  const renderNewsCard = (article) => {
    if (!article || !article.title) return null;

    return (
      <div
        key={article.url}
        className={`rounded-lg shadow-lg p-6 transition-transform hover:scale-105 relative ${
          theme === 'light' ? 'bg-[var(--nt-fixed-card,#1f2937)] text-white' : 'bg-white text-black'
        }`}
      >
        <div className={`w-10 h-10 shadow-lg rounded-full absolute top-4 right-4 grid place-items-center ${
          theme === 'light' ? 'bg-black' : 'bg-gray-800'
        }`}>
          <button
            onClick={() => handleBookmark(article)}
            className="p-2 rounded-full"
            aria-label={likedArticles.some(a => a.url === article.url) ? 'Remove bookmark' : 'Add bookmark'}
          >
            {likedArticles.some(a => a.url === article.url) ? (
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
            onError={(e) => (e.target.src = defaultImage)}
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg leading-6">{article.title}</h3>
            <p className="mt-2">
              {article.description
                ? article.description.length > 100
                  ? `${article.description.substring(0, 100)}...`
                  : article.description
                : 'No description available'}
            </p>
            <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(article.publishedAt).toLocaleDateString()}
            </p>
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="container mx-auto px-4 py-8">
        <Toaster />

        <h1 className="text-3xl font-bold text-center my-6">
          LATEST <span className="text-blue-600">NEWS</span>
        </h1>
        <p className={`text-center mb-8 ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
          Most recent news
        </p>

        {/* Search and Category Controls */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`p-3 w-full max-w-lg rounded-full shadow-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light'
                  ? 'bg-black text-white placeholder-gray-400 border-gray-600'
                  : 'bg-white text-black placeholder-gray-600 border-gray-300'
              }`}
            />
          </div>

          {!isSearching && (
            <div className="flex justify-center space-x-4 flex-wrap">
              {['general', 'business', 'sports', 'politics', 'entertainment'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full transition-colors mb-2 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : theme === 'light'
                        ? 'text-white hover:bg-gray-800'
                        : 'text-black hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* News Content */}
        {loading ? (
          <div className="text-center py-8">Loading news...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : selectedNews.length === 0 ? (
          <div className="text-center py-8">No news articles found. Try a different search or category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedNews.map(renderNewsCard)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-full ${
                currentPage === 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-full ${
                currentPage === totalPages
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
