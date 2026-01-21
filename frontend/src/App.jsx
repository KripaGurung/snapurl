import './App.css'
import {  BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import CreateUrl from './pages/createUrl.jsx';

function AppContent() {


  return (
    <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/create" element={<CreateUrl />} />
    </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;