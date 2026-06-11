import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import VenuePage from '@/pages/VenuePage';
import SeatingPage from '@/pages/SeatingPage';
import StagePage from '@/pages/StagePage';
import DecorationPage from '@/pages/DecorationPage';
import CeremonyPage from '@/pages/CeremonyPage';
import PreviewPage from '@/pages/PreviewPage';
import SharePage from '@/pages/SharePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/venue" replace />} />
        <Route element={<Layout />}>
          <Route path="/venue" element={<VenuePage />} />
          <Route path="/seating" element={<SeatingPage />} />
          <Route path="/stage" element={<StagePage />} />
          <Route path="/decoration" element={<DecorationPage />} />
          <Route path="/ceremony" element={<CeremonyPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/share" element={<SharePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
