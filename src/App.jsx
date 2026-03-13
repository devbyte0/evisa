// App.jsx
import { Routes, Route } from 'react-router-dom';
import VerificaViza from './pages/VerificaViza';

import AdminVisas from './pages/AdminVisas';
import AdminCreateVisa from './pages/AdminCreateVisa';
import AdminEditVisa from './pages/AdminEditVisa';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public route - Visa verification */}
      <Route path="/check-my-visa" element={<VerificaViza />} />
      
      {/* Simple admin routes - no login required */}
      
      <Route path="/visas" element={<AdminVisas />} />
      <Route path="/visas/create" element={<AdminCreateVisa />} />
      <Route path="/visas/edit/:id" element={<AdminEditVisa />} />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<VerificaViza />} />
    </Routes>
  );
}

export default App;