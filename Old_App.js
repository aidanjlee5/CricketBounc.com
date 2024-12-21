import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import Header from './components/Header.js';
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
import About from './components/About.js';
import BCL from './components/BCL.js';
import Videos from './components/Videos.js';
import BurgerMenu from './components/BurgerMenu.js';
import Council from './pages/Council.js';
import Motives from './pages/Motives.js';
import Constitution from './pages/Constitution.js';
import Teams from './pages/Teams.js';
import Matches from './pages/Matches.js';
import SignUp from './pages/SignUp.js';
import CricketRules from './pages/CricketRules.js';
import Socials from './pages/Socials.js';
import FAQ from './pages/FAQ.js';
import ContactUs from './pages/ContactUs.js';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />}>
            <Route path="council" element={<Council />} />
            <Route path="motives" element={<Motives />} />
            <Route path="constitution" element={<Constitution />} />
          </Route>
          <Route path="/bcl" element={<BCL />}>
            <Route path="teams" element={<Teams />} />
            <Route path="matches" element={<Matches />} />
            <Route path="signup" element={<SignUp />} />
          </Route>
          <Route path="/videos" element={<Videos />} />
          <Route path="/burger-menu" element={<BurgerMenu />}>
            <Route path="rules" element={<CricketRules />} />
            <Route path="socials" element={<Socials />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contact" element={<ContactUs />} />
          </Route>
          <Route path="*" element={<Home />} /> {/* Fallback route */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;