/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Apply from './pages/Apply';
import HRLogin from './pages/HRLogin';
import HRDashboard from './pages/HRDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="apply/:id" element={<Apply />} />
          <Route path="hr/login" element={<HRLogin />} />
          <Route path="hr/dashboard" element={<HRDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
