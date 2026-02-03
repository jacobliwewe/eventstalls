import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Success from './pages/Success';
import SignIn from './pages/SignIn';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<Booking />} />
            <Route path="/success" element={<Success />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
