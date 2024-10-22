import './App.css';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Login />} /> {/* Default to login */}
            <Route path="/home" element={<Home />} /> {/* Home Route */}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
