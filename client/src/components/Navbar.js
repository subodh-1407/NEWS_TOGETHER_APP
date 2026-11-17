import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon, MenuIcon, XIcon } from '@heroicons/react/solid';
import toast from 'react-hot-toast';
import img from '../newtogether-logo.svg';
import darkLogo from '../newtogether-logo-dark.svg';
import { AuthContext } from '../AuthContext';
import { ThemeContext } from './ThemeContext';

const links = [['/home','Home'],['/search','Search'],['/favourite','Favourite'],['/support','Support'],['/settings','Settings']];
export default function Navbar() {
 const navigate = useNavigate();
 const location = useLocation();
 const { setIsAuthenticated } = useContext(AuthContext);
 const { theme, toggleTheme } = useContext(ThemeContext);
 const [menuOpen,setMenuOpen] = useState(false);
 useEffect(()=>{setMenuOpen(false);},[location.pathname,location.search]);
 useEffect(()=>{const close=event=>{if(event.key==='Escape')setMenuOpen(false);};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[]);
 function logout(){localStorage.removeItem('token');setIsAuthenticated(false);navigate('/');toast.success('Logged out.');}
 return <nav className="site-navbar bg-black dark:bg-white" aria-label="Main navigation">
   <div className="navbar-inner">
     <Link to="/home" aria-label="NewTogether home" className="navbar-logo"><img src={theme==='dark'?darkLogo:img} alt="NewTogether" width="40" height="40"/></Link>
     <ul id="primary-navigation" className={'nav-links '+(menuOpen?'is-open':'')}>
       {links.map(([path,label])=><li key={path}><Link to={path} onClick={()=>setMenuOpen(false)} aria-current={location.pathname===path?'page':undefined} className="nav-link block py-7 text-white dark:text-black hover:text-blue-500 dark:hover:text-blue-500 relative group">{label}<span aria-hidden="true" className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200"/></Link></li>)}
     </ul>
     <div className="navbar-actions">
       <button className="navbar-logout text-white dark:text-black border border-blue-700 rounded-md" onClick={logout}>Log out</button>
       <button className="navbar-icon" onClick={toggleTheme} aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'}>{theme==='light'?<MoonIcon/>:<SunIcon/>}</button>
       <button className="navbar-icon mobile-menu-toggle" onClick={()=>setMenuOpen(value=>!value)} aria-label={menuOpen?'Close navigation':'Open navigation'} aria-expanded={menuOpen} aria-controls="primary-navigation">{menuOpen?<XIcon/>:<MenuIcon/>}</button>
     </div>
   </div>
 </nav>;
}
