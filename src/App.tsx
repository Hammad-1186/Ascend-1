import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HrDirectoryPage from './features/hr/HrDirectoryPage';
import HrMemberFormPage from './features/hr/HrMemberFormPage';
import HrMemberViewPage from './features/hr/HrMemberViewPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/people" element={<HrDirectoryPage />} />
        <Route path="/people/new" element={<HrMemberFormPage mode="create" />} />
        <Route path="/people/:id" element={<HrMemberViewPage />} />
        <Route path="/people/:id/edit" element={<HrMemberFormPage mode="edit" />} />
        {/* Other pages plug in here with the same layout + sidebar. */}
        <Route path="*" element={<Navigate to="/people" replace />} />
      </Route>
    </Routes>
  );
}
