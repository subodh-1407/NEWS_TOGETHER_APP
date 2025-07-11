// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { FcLike, FcLikePlaceholder } from "react-icons/fc";
// import toast, { Toaster } from 'react-hot-toast';
// import defaultImage from '../news-notdefined.jpeg';
// import { useLocation } from 'react-router-dom';
// import Navbar from './Navbar';
// import Footer from './Footer';
// import { ThemeContext } from './ThemeContext';

// const apiKey = 'aa2c7282bcd749e68c22b3ff5df8a0ad'; // Updated API key

// const Search = () => {
//   const location = useLocation();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedNews, setSelectedNews] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isSearching, setIsSearching] = useState(false);
//   const [likedArticles, setLikedArticles] = useState([]);
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const category = params.get('q');

//     if (category) {
//       setSearchQuery(category);
//       fetchSearchData(category, currentPage);
//     }
//   }, [location.search, currentPage]);

//   useEffect(() => {
//     if (searchQuery) {
//       fetchSearchData(searchQuery, currentPage);
//     }
//   }, [searchQuery, currentPage]);

//   const fetchSearchData = async (query, page) => {
//     const pageSize = 6;
//     const url = `https://newsapi.org/v2/everything?q=${query}&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`;

//     try {
//       const response = await axios.get('https://news-together-app.onrender.com/api/v1/news?category=general');
//       if (response.status === 200) {
//         setSelectedNews(response.data.articles);
//         setTotalPages(Math.ceil(response.data.totalResults / pageSize));
//       } else {
//         throw new Error('Failed to fetch data');
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setSelectedNews([]);
//       setTotalPages(1);
//     }
//   };

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setIsSearching(e.target.value.length > 0);
//     setCurrentPage(1);
//   };

//   const clickHandler = async (article) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         toast.error("Please login to manage favorites");
//         return;
//       }

//       const existing = likedArticles.find((a) => a.url === article.url);
//       let updatedLikedArticles;

//       if (existing) {
//         const articleId = existing._id;

//         updatedLikedArticles = likedArticles.filter((a) => a.url !== article.url);

//         await axios.delete(`https://news-together-app.onrender.com/api/v1/deleteBookmarkedNews/${articleId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         toast.success("Removed from Favourites");
//       } else {
//         const response = await axios.post(
//           "https://news-together-app.onrender.com/api/v1/addToBookmarkedNews",
//           article,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             },
//             withCredentials: true
//           }
//         );

//         const savedArticle = response.data.savedArticle || article;

//         updatedLikedArticles = [...likedArticles, savedArticle];

//         toast.success("Added to Favourites");
//       }

//       setLikedArticles(updatedLikedArticles);
//       localStorage.setItem('likedArticles', JSON.stringify(updatedLikedArticles));
//     } catch (err) {
//       console.error(err);
//       toast.error("An error occurred");
//     }
//   };

//   useEffect(() => {
//     const storedLikedArticles = localStorage.getItem('likedArticles');
//     if (storedLikedArticles) {
//       setLikedArticles(JSON.parse(storedLikedArticles));
//     }
//   }, []);

//   const renderNewsCards = (news) => {
//     if (!news || news.length === 0) return null;

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {news.map((article, index) => (
//           <div key={index} className={`rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 relative ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}>
//             <div className='w-[40px] h-[40px] bg-black shadow-lg rounded-full absolute right-2 bottom-56 grid place-items-center'>
//               <button onClick={() => clickHandler(article)}>
//                 {likedArticles.some((a) => a.url === article.url) ? (
//                   <FcLike fontSize="1.75rem" />
//                 ) : (
//                   <FcLikePlaceholder fontSize="1.75rem" />
//                 )}
//               </button>
//             </div>
//             <a href={article.url} target="_blank" rel="noopener noreferrer">
//               <img 
//                 src={article.urlToImage || defaultImage} 
//                 alt={article.title} 
//                 className="w-full h-48 object-cover rounded-md mb-4" 
//               />
//               <div className="p-4">
//                 <p className="font-semibold text-lg leading-6">{article.title}</p>
//                 <p className="mt-2">
//                   {article.description ? (
//                     article.description.length > 100 ?
//                       `${article.description.substr(0, 100)}...` :
//                       article.description
//                   ) : 'No description available.'}
//                 </p>
//               </div>
//               <p className="text-sm">{new Date(article.publishedAt).toLocaleDateString()}</p>
//             </a>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className={`search-page ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}>
//       <Navbar />
//       <div className="w-full h-full px-4 sm:px-10 lg:px-32 py-14">
//         <Toaster />

//         {/* Search Bar */}
//         <div className="mb-8 flex justify-center">
//           <input
//             type="text"
//             placeholder="Search news..."
//             className={`p-3 pl-10 w-full sm:w-2/3 lg:w-1/2 rounded-full shadow-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-black text-white placeholder-gray-400 border-gray-600' : 'bg-white text-black placeholder-gray-600 border-gray-300'}`}
//             value={searchQuery}
//             onChange={handleSearchChange}
//           />
//         </div>

//         {/* Selected News Section */}
//         {selectedNews.length > 0 && (
//           <div id="selectedNews" className="mb-8">
//             <h2 className="text-3xl font-bold text-center mb-6">{isSearching ? 'Search Results' : 'Top Headlines'}</h2>
//             {renderNewsCards(selectedNews)}
//           </div>
//         )}

//         {/* Pagination Controls */}
//         {totalPages > 1 && (
//           <div className="flex justify-center space-x-4">
//             <button
//               className={`px-4 py-2 text-white rounded-full transition-opacity ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-700 hover:bg-blue-600'} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
//               onClick={() => setCurrentPage(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </button> 
//             <button
//               className={`px-4 py-2 text-white rounded-full transition-opacity ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-700 hover:bg-blue-600'} ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
//               onClick={() => setCurrentPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Search;"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { FcLike, FcLikePlaceholder } from "react-icons/fc"
import toast, { Toaster } from "react-hot-toast"
import defaultImage from "../news-notdefined.jpeg"
import { useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { ThemeContext } from "./ThemeContext"

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://news-together-app.onrender.com"
const apiKey = "aa2c7282bcd749e68c22b3ff5df8a0ad" // Updated API key

const Search = () => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNews, setSelectedNews] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [likedArticles, setLikedArticles] = useState([])
  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const category = params.get("q")

    if (category) {
      setSearchQuery(category)
      fetchSearchData(category, currentPage)
    }
  }, [location.search, currentPage])

  useEffect(() => {
    if (searchQuery) {
      fetchSearchData(searchQuery, currentPage)
    }
  }, [searchQuery, currentPage])

  const fetchSearchData = async (query, page) => {
    const pageSize = 6

    try {
      let response

      if (query && query.trim()) {
        // Use search endpoint for actual search queries
        const url = `${API_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
        response = await axios.get(url, { timeout: 10000 })
      } else {
        // Use general news endpoint for default/empty queries
        const url = `${API_BASE_URL}/api/v1/news?category=general&page=${page}&pageSize=${pageSize}`
        response = await axios.get(url, { timeout: 10000 })
      }

      if (response.status === 200 && response.data.articles) {
        setSelectedNews(response.data.articles)
        setTotalPages(Math.ceil(response.data.totalResults / pageSize))
      } else {
        throw new Error("Failed to fetch data")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setSelectedNews([])
      setTotalPages(1)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setIsSearching(e.target.value.length > 0)
    setCurrentPage(1)
  }

  const clickHandler = async (article) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please login to manage favorites")
        return
      }

      const existing = likedArticles.find((a) => a.url === article.url)
      let updatedLikedArticles

      if (existing) {
        const articleId = existing._id

        updatedLikedArticles = likedArticles.filter((a) => a.url !== article.url)

        await axios.delete(`https://news-together-app.onrender.com/api/v1/deleteBookmarkedNews/${articleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success("Removed from Favourites")
      } else {
        const response = await axios.post(
          "https://news-together-app.onrender.com/api/v1/addToBookmarkedNews",
          article,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          },
        )

        const savedArticle = response.data.savedArticle || article

        updatedLikedArticles = [...likedArticles, savedArticle]

        toast.success("Added to Favourites")
      }

      setLikedArticles(updatedLikedArticles)
      localStorage.setItem("likedArticles", JSON.stringify(updatedLikedArticles))
    } catch (err) {
      console.error(err)
      toast.error("An error occurred")
    }
  }

  useEffect(() => {
    const storedLikedArticles = localStorage.getItem("likedArticles")
    if (storedLikedArticles) {
      setLikedArticles(JSON.parse(storedLikedArticles))
    }
  }, [])

  const renderNewsCards = (news) => {
    if (!news || news.length === 0) return null

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 relative ${theme === "light" ? "bg-black text-white" : "bg-white text-black"}`}
          >
            <div className="w-[40px] h-[40px] bg-black shadow-lg rounded-full absolute right-2 bottom-56 grid place-items-center">
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
                  {article.description
                    ? article.description.length > 100
                      ? `${article.description.substr(0, 100)}...`
                      : article.description
                    : "No description available."}
                </p>
              </div>
              <p className="text-sm">{new Date(article.publishedAt).toLocaleDateString()}</p>
            </a>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`search-page ${theme === "light" ? "bg-black text-white" : "bg-white text-black"}`}>
      <Navbar />
      <div className="w-full h-full px-4 sm:px-10 lg:px-32 py-14">
        <Toaster />

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search news..."
            className={`p-3 pl-10 w-full sm:w-2/3 lg:w-1/2 rounded-full shadow-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-black text-white placeholder-gray-400 border-gray-600" : "bg-white text-black placeholder-gray-600 border-gray-300"}`}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Selected News Section */}
        {selectedNews.length > 0 && (
          <div id="selectedNews" className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-6">{isSearching ? "Search Results" : "Top Headlines"}</h2>
            {renderNewsCards(selectedNews)}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4">
            <button
              className={`px-4 py-2 text-white rounded-full transition-opacity ${theme === "light" ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-700 hover:bg-blue-600"} ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className={`px-4 py-2 text-white rounded-full transition-opacity ${theme === "light" ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-700 hover:bg-blue-600"} ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Search
