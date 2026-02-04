import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Success from './pages/Success';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CreateEvent from './pages/admin/CreateEvent';
import Events from './pages/admin/Events';
import Transactions from './pages/admin/Transactions';
import Profile from './pages/Profile';

import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<Booking />} />
            <Route path="/success" element={<Success />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/events" element={<Events />} />
            <Route path="/admin/create-event" element={<CreateEvent />} />
            <Route path="/admin/edit-event/:id" element={<CreateEvent />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
