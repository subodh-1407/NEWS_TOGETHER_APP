import React, { useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import Categories from './components/Categories';
import Popular from './components/Popular';
import Dashboard from './components/Dashboard';
import Explore from './components/Explore';
import Home from './components/Home';
import Search from './components/Search';
import Favourite from './components/Favourite';
import Support from './components/Supp';
import Settings from './components/Settings';
import { AuthContext } from './AuthContext';
import Auth from './components/Auth';

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <ThemeProvider>
      <Router>
        <div className="App" id="top">
          {isAuthenticated ? (
            <>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/popular" element={<Popular />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/favourite" element={<Favourite />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </>
          ) : (
            <>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
