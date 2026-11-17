import React, { useState, useEffect, useContext } from 'react';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import defaultImage from '../news-notdefined.jpeg';
import LanguageSelector from './language-selector';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeContext } from './ThemeContext';
import useBookmarks from '../hooks/useBookmarks';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [selectedNews, setSelectedNews] = useState([]);
  const { likedArticles, toggleBookmark: clickHandler } = useBookmarks();
  const { theme } = useContext(ThemeContext);

  // Load translated articles on language change
  useEffect(() => {
    const articles = t('articles', { returnObjects: true });
    setSelectedNews(articles);
  }, [i18n.language, t]);

  const renderNewsCards = (news) => {
    if (!Array.isArray(news) || news.length === 0) {
      return <p>{t("No news articles found.")}</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 relative ${
              theme === 'light' ? 'bg-[var(--nt-fixed-card,#1f2937)] text-white' : 'bg-white text-black'
            }`}
          >
            <div className={`w-[40px] h-[40px] ${theme === 'light' ? 'bg-black' : 'bg-white'} shadow-lg rounded-full absolute right-2 bottom-56 grid place-items-center`}>
              <button aria-label={likedArticles.some(a => a.url === article.url) ? 'Remove bookmark' : 'Add bookmark'} onClick={() => clickHandler(article)} className={`p-2 rounded-full ${theme === 'light' ? 'bg-black' : 'bg-white'}`}>
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
                  {article.description
                    ? article.description.length > 100
                      ? `${article.description.substr(0, 100)}...`
                      : article.description
                    : t("No description available.")}
                </p>
              </div>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-400' : 'text-gray-800'}`}>
                {new Date(article.publishedAt).toLocaleDateString()}
              </p>
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full min-h-screen ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Navbar />
      <div className="px-4 sm:px-10 lg:px-32 py-4">
        <h2 className="font-bold text-3xl py-4 text-center uppercase">
          {t("multilanguage")} <span className="text-blue-700">{t("support")}</span>
        </h2>
        <h2 className="font-bold text-gray-500 text-lg py-2 text-center">
          {t("most recent news")}
        </h2>

        <div className="my-4 flex justify-center space-x-4">
          <LanguageSelector />
        </div>

        <div id="selectedNews" className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-6">{t("Top Headlines")}</h2>
          {renderNewsCards(selectedNews)}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
