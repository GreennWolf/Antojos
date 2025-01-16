import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Salones } from './pages/Salones';
import { Login } from './pages/Login';
import { Personal } from './pages/Personal';
import { MainHub } from './components/MainHub';
import { ToastContainer } from 'react-toastify';
import MesasPage from './components/SalonesTab/MesasPage';

function App() {
  return (
    <BrowserRouter>
          <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainHub />} />
        <Route path="/mesas/:mesaId" element={<MesasPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;