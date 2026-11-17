// src/Navbar.js
import React, { useContext } from 'react';
import img from '../newtogether-logo.svg';
import darkLogo from '../newtogether-logo-dark.svg';
import indiaflag from '../india-flag.svg';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import toast from 'react-hot-toast';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';
import { ThemeContext } from './ThemeContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const logOutHandler = () => {
        localStorage.removeItem("token");
        navigate("/");
        setIsAuthenticated(false);
        toast.success("Logged out.");
    };

    return (
        <nav className="bg-black dark:bg-white">
            <div className="relative w-[1080px] mx-auto flex items-center justify-between">
                <Link to="/home" aria-label="NewTogether home">
                    <div className='cursor-pointer py-7 pr-7 flex items-center'>
                        <img src={theme === 'dark' ? darkLogo : img} alt="NewTogether" width="40px" height="40px" />
                    </div>
                </Link>

                <ul className="flex space-x-10">
                    <li className="hidden lg:block"><Link to="/home" className="block text-white dark:text-black text-xl font-serif py-7 hover:text-blue-500 dark:hover:text-blue-500 cursor-pointer transition-all duration-200 relative group">Home<span aria-hidden="true" className="absolute bottom-0 w-full h-1 bg-blue-500 block opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200"></span></Link></li>
                    <li className="hidden lg:block"><Link to="/search" className="block text-white dark:text-black text-xl font-serif py-7 hover:text-blue-500 dark:hover:text-blue-500 cursor-pointer transition-all duration-200 relative group">Search<span aria-hidden="true" className="absolute bottom-0 w-full h-1 bg-blue-500 block opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200"></span></Link></li>
                    <li className="hidden lg:block"><Link to="/favourite" className="block text-white dark:text-black text-xl font-serif py-7 hover:text-blue-500 dark:hover:text-blue-500 cursor-pointer transition-all duration-200 relative group">Favourite<span aria-hidden="true" className="absolute bottom-0 w-full h-1 bg-blue-500 block opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200"></span></Link></li>
                    <li className="hidden lg:block"><Link to="/support" className="block text-white dark:text-black text-xl font-serif py-7 hover:text-blue-500 dark:hover:text-blue-500 cursor-pointer transition-all duration-200 relative group">Support<span aria-hidden="true" className="absolute bottom-0 w-full h-1 bg-blue-500 block opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200"></span></Link></li>
                    <li className="hidden lg:block"><Link to="/settings" className="block text-white dark:text-black text-xl font-serif py-7 hover:text-blue-500 dark:hover:text-blue-500 cursor-pointer transition-all duration-200 relative group">Settings<span aria-hidden="true" className="absolute bottom-0 w-full h-1 bg-blue-500 block opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200"></span></Link></li>
                </ul>

                <div className="flex space-x-6 items-center">
                    <img src={indiaflag} alt="India" width="28px" height="20px" className="hidden lg:block" />
                    <button className="py-3 px-5 text-white dark:text-black border-blue-700 dark:border-black border rounded-md text-xl font-bold flex transition-all duration-200 hover:text-black hover:bg-white dark:hover:text-white dark:hover:bg-black" onClick={logOutHandler}>
                        Log out
                        <svg viewBox="0 0 24 24" focusable="false" className="w-[20px] h-[20px] ml-3 mt-1"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>
                    </button>
                    <button onClick={toggleTheme} className="focus:outline-none">
                        {theme === 'light' ? (
                            <MoonIcon className="w-6 h-6 text-white" />
                        ) : (
                            <SunIcon className="w-6 h-6 text-black" />
                        )}
                    </button>
                </div>
            </div>
            <div className='flex justify-center items-center'>
                <div className='w-5/6 border-[1.5px] border-white dark:border-gray-300 my-8 rounded-lg '></div>
            </div>
        </nav>
    );
};

export default Navbar;
