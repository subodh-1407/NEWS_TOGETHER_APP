import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultImage from '../news-notdefined.jpeg';
import { FaAngleLeft } from "react-icons/fa6";

const apiKey = 'aa2c7282bcd749e68c22b3ff5df8a0ad';

const Main = () => {
    const [heroImages, setHeroImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchHeroImages();
    }, []);

   const fetchHeroImages = async () => {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const articles = response.data.articles;

    if (articles.length > 0) {
      const validImages = articles.map(article =>
        article?.urlToImage && article.urlToImage.startsWith('http')
          ? article.urlToImage
          : null
      ).filter(Boolean);

      if (validImages.length === 0) {
        setHeroImages([defaultImage]);
      } else {
        setHeroImages(validImages);
      }
    } else {
      console.warn("No articles found. Try changing the country or query.");
      setHeroImages([defaultImage]);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    setHeroImages([defaultImage]);
  }
};



    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div>
            <section
                className="relative bg-blue-900"
                style={{
                    backgroundImage: `url(${heroImages[currentImageIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black from-2% via-transparent to-black to-1%"></div>

                <div className="w-10/12 max-w-[1080px] h-[550px] flex flex-col lg:flex-row justify-between items-center mx-auto relative">
                    <button
                        onClick={handlePrevImage}
                        className="absolute left-[-100px] top-1/2 transform -translate-y-1/2 border-solid border-[4px] border-white bg-transparent hover:bg-blue-700 hover:opacity-85 w-14 h-14 rounded-full"
                    >
                        <FaAngleLeft className='stroke-[5px] w-6 h-6 md:w-10 md:h-10 text-blue-700 hover:text-white transform translate-x-1 translate-y-0' />
                    </button>
                    <button
                        onClick={handleNextImage}
                        className="absolute right-[-100px] top-1/2 transform -translate-y-1/2 border-solid border-[4px] border-white bg-transparent hover:bg-blue-700 hover:opacity-85 font-extrabold text-2xl w-14 h-14 rounded-full"
                    >
                        <FaAngleLeft className='stroke-[5px] w-6 h-6 md:w-10 md:h-10 text-blue-700 hover:text-white transform translate-x-[6px] translate-y-0 rotate-180' />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Main;
