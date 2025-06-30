// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import defaultImage from '../news-notdefined.jpeg';
// import Footer from './Footer';
// import Navbar from './Navbar';
// import { ThemeContext } from './ThemeContext';

// const Favourite = () => {
//   const [likedArticles, setLikedArticles] = useState([]);
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     const fetchLikedArticles = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get("https://news-together-app.onrender.com/v1/getAllBookmarkedNews", {
//           headers: {
//             Authorization: `Bearer ${token}`
//           },
//           withCredentials: true
//         });

//         console.log("API Response:", response);
//         console.log("Bookmarked News:", response.data.bookmarkedNews);

//         if (Array.isArray(response.data.bookmarkedNews)) {
//           setLikedArticles(response.data.bookmarkedNews);
//         } else {
//           console.error('Expected an array but received:', response.data.bookmarkedNews);
//         }
//       } catch (error) {
//         console.error('Error fetching liked articles:', error);
//       }
//     };

//     fetchLikedArticles();
//   }, []);

//   const removeFromFavourites = async (articleId) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`https://news-together-app.onrender.com/api/v1/deleteBookmarkedNews/${articleId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         },
//         withCredentials: true
//       });

//       setLikedArticles(prev => prev.filter(article => article._id !== articleId));
//     } catch (error) {
//       console.error('Error removing article from favourites:', error);
//     }
//   };

//   const renderLikedArticles = () => {
//     if (likedArticles.length === 0) {
//       return (
//         <div>
//           <p className={`text-center ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
//             No favourite articles yet.
//           </p>
//         </div>
//       );
//     }

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-3 gap-6">
//         {likedArticles.map((article, index) => (
//           <div
//             key={index}
//             className={`rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 ${theme === 'dark' ? 'bg-gray-200' : 'bg-[#212121]'}`}
//           >
//             <a href={article.url} target="_blank" rel="noopener noreferrer">
//               <img
//                 src={article.image || defaultImage}
//                 alt={article.title}
//                 className="w-full h-48 object-cover rounded-md mb-4"
//               />
//               <div className="p-4">
//                 <p className={`font-semibold text-lg leading-6 ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
//                   {article.title}
//                 </p>
//                 <p className={`mt-2 ${theme === 'dark' ? 'text-gray-700' : 'text-[#888888]'}`}>
//                   {article.description
//                     ? article.description.length > 100
//                       ? `${article.description.substr(0, 100)}...`
//                       : article.description
//                     : 'No description available.'}
//                 </p>
//                 <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-700' : 'text-[#888888]'}`}>
//                   {new Date(article.publishedAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </a>

//             {/* Remove button */}
//             <div className="mt-4 text-right">
//               <button
//                 onClick={() => {
//                   if (window.confirm("Are you sure you want to remove this article from favourites?")) {
//                     removeFromFavourites(article._id);
//                   }
//                 }}
//                 className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 text-sm"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className={`w-full h-full px-4 sm:px-10 lg:px-32 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}>
//         <h2 className={`font-bold text-[32px] pt-4 text-center ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
//           Favourite&nbsp;
//           <span className="text-blue-700">Articles</span>
//         </h2>
//         <h2 className={`font-bold text-[16px] py-2 text-center ${theme === 'dark' ? 'text-gray-700' : 'text-[#888888]'}`}>
//           Liked Articles
//         </h2>
//         {renderLikedArticles()}
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Favourite;"use client""use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import defaultImage from "../news-notdefined.jpeg"
import Footer from "./Footer"
import Navbar from "./Navbar"
import { ThemeContext } from "./ThemeContext"
import toast from "react-hot-toast"

const Favourite = () => {
  const [likedArticles, setLikedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const { theme } = useContext(ThemeContext)

  // Fixed API base URL
  const API_BASE_URL = "https://news-together-app.onrender.com"

  useEffect(() => {
    const fetchLikedArticles = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          console.log("No token found in localStorage")
          toast.error("Please login to view your bookmarks")
          setLoading(false)
          return
        }

        console.log("Token found, making API request...")
        console.log("API URL:", `${API_BASE_URL}/api/v1/getAllBookmarkedNews`)

        const response = await axios.get(`${API_BASE_URL}/api/v1/getAllBookmarkedNews`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        })

        console.log("API Response:", response)
        console.log("Bookmarked News:", response.data.bookmarkedNews)

        if (Array.isArray(response.data.bookmarkedNews)) {
          setLikedArticles(response.data.bookmarkedNews)
        } else {
          console.error("Expected an array but received:", response.data.bookmarkedNews)
          setLikedArticles([])
        }
      } catch (error) {
        console.error("Error fetching liked articles:", error)
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
        })

        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.")
          localStorage.removeItem("token")
        } else if (error.response?.status === 404) {
          toast.error("API endpoint not found. Please check server configuration.")
        } else {
          toast.error("Failed to load bookmarks")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLikedArticles()
  }, [API_BASE_URL])

  const removeFromFavourites = async (articleId) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("Please login to manage bookmarks")
        return
      }

      console.log("Removing article with ID:", articleId)
      console.log("Delete URL:", `${API_BASE_URL}/api/v1/deleteBookmarkedNews/${articleId}`)

      await axios.delete(`${API_BASE_URL}/api/v1/deleteBookmarkedNews/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })

      setLikedArticles((prev) => prev.filter((article) => article._id !== articleId))
      toast.success("Article removed from favourites")
    } catch (error) {
      console.error("Error removing article from favourites:", error)
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
      })

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
      } else if (error.response?.status === 404) {
        toast.error("Article not found or already removed.")
      } else {
        toast.error("Failed to remove article")
      }
    }
  }

  const renderLikedArticles = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <p className={`${theme === "dark" ? "text-black" : "text-white"}`}>Loading your bookmarks...</p>
        </div>
      )
    }

    if (likedArticles.length === 0) {
      return (
        <div className="text-center py-8">
          <p className={`${theme === "dark" ? "text-black" : "text-white"}`}>No favourite articles yet.</p>
          <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
            Start bookmarking articles to see them here!
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-3 gap-6">
        {likedArticles.map((article, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 ${theme === "dark" ? "bg-gray-200" : "bg-[#212121]"}`}
          >
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img
                src={article.image || defaultImage}
                alt={article.title}
                className="w-full h-48 object-cover rounded-md mb-4"
                onError={(e) => {
                  e.target.src = defaultImage
                }}
              />
              <div className="p-4">
                <p className={`font-semibold text-lg leading-6 ${theme === "dark" ? "text-black" : "text-white"}`}>
                  {article.title}
                </p>
                <p className={`mt-2 ${theme === "dark" ? "text-gray-700" : "text-[#888888]"}`}>
                  {article.description
                    ? article.description.length > 100
                      ? `${article.description.substr(0, 100)}...`
                      : article.description
                    : "No description available."}
                </p>
                <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-700" : "text-[#888888]"}`}>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </a>

            {/* Remove button */}
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to remove this article from favourites?")) {
                    removeFromFavourites(article._id)
                  }
                }}
                className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 text-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className={`w-full min-h-screen px-4 sm:px-10 lg:px-32 ${theme === "dark" ? "bg-white" : "bg-black"}`}>
        <h2 className={`font-bold text-[32px] pt-4 text-center ${theme === "dark" ? "text-black" : "text-white"}`}>
          Favourite&nbsp;
          <span className="text-blue-700">Articles</span>
        </h2>
        <h2
          className={`font-bold text-[16px] py-2 text-center ${theme === "dark" ? "text-gray-700" : "text-[#888888]"}`}
        >
          Liked Articles
        </h2>
        {renderLikedArticles()}
      </div>
      <Footer />
    </div>
  )
}

export default Favourite
