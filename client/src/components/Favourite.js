import React, { useContext } from 'react';
import useBookmarks from '../hooks/useBookmarks';
import defaultImage from '../news-notdefined.jpeg';
import Footer from './Footer';
import Navbar from './Navbar';
import { ThemeContext } from './ThemeContext';

const Favourite = () => {
  const { likedArticles, removeBookmark } = useBookmarks();
  const { theme } = useContext(ThemeContext);

  const renderLikedArticles = () => {
    if (likedArticles.length === 0) {
      return (
        <div>
          <p className={`text-center ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
            No favourite articles yet.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-3 gap-6">
        {likedArticles.map((article, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 ${theme === 'dark' ? 'bg-gray-200' : 'bg-[var(--nt-fixed-card,#1f2937)]'}`}
          >
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img
                src={article.image || defaultImage}
                alt={article.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <div className="p-4">
                <p className={`font-semibold text-lg leading-6 ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
                  {article.title}
                </p>
                <p className={`mt-2 ${theme === 'dark' ? 'text-gray-700' : 'text-[var(--nt-fixed-muted,#9ca3af)]'}`}>
                  {article.description
                    ? article.description.length > 100
                      ? `${article.description.substr(0, 100)}...`
                      : article.description
                    : 'No description available.'}
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-700' : 'text-[var(--nt-fixed-muted,#9ca3af)]'}`}>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </a>

            {/* Remove button */}
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to remove this article from favourites?")) {
                    removeBookmark(article);
                  }
                }}
                className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className={`w-full h-full px-4 sm:px-10 lg:px-32 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}>
        <h2 className={`font-bold text-[32px] pt-4 text-center ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
          Favourite&nbsp;
          <span className="text-blue-700">Articles</span>
        </h2>
        <h2 className={`font-bold text-[16px] py-2 text-center ${theme === 'dark' ? 'text-gray-700' : 'text-[var(--nt-fixed-muted,#9ca3af)]'}`}>
          Liked Articles
        </h2>
        {renderLikedArticles()}
      </div>
      <Footer />
    </div>
  );
};

export default Favourite;
