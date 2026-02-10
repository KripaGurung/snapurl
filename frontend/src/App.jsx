import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import CreateUrl from './pages/createUrl.jsx';
import MessageView from './pages/MessageView.jsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={
            <>
              <Navbar />  
              <CreateUrl />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/m/:token" element={<MessageView />} />
      </Routes>
    </>
  );
}

export default App;