import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LeadsPage from './pages/Leads/LeadsPage';
import CustomersPage from './pages/Customers/CustomersPage';
import OpportunitiesPage from './pages/Opportunities/OpportunitiesPage';
import FollowupsPage from './pages/Followups/FollowupsPage';
import ContractsPage from './pages/Contracts/ContractsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/followups" element={<FollowupsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
