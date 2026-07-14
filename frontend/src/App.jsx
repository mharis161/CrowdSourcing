import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskerDashboard from './pages/TaskerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import WalletPage from './pages/WalletPage';
import ProjectDashboard from './pages/ProjectDashboard';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/tasker" element={<TaskerDashboard />} />
        <Route path="/dashboard/company" element={<CompanyDashboard />} />
        <Route path="/dashboard/company/projects/:taskId" element={<ProjectDashboard />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
