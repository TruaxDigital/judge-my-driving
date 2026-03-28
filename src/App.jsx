import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Navigate } from 'react-router-dom';
import ScanSticker from './pages/ScanSticker';
import Dashboard from './pages/Dashboard.jsx';
import MapView from './pages/MapView';
import Stickers from './pages/Stickers';
import Settings from './pages/Settings';
import DashboardLayout from './components/dashboard/DashboardLayout';
import PreviewScan from './pages/PreviewScan';
import Analytics from './pages/Analytics';
import Reporting from './pages/Reporting';
import FleetDashboard from './pages/FleetDashboard';
import Pricing from './pages/Pricing';
import Leaderboard from './pages/Leaderboard';
import Support from './pages/Support';
import GetStarted from './pages/GetStarted';
import Liability from './pages/Liability';
import AdminUsers from './pages/AdminUsers';
import DriverProfile from './pages/DriverProfile';
import PartnerSignup from './pages/PartnerSignup';
import StudentDrivers from './pages/StudentDrivers';
import SeniorDrivers from './pages/SeniorDrivers';
import PartnerPortal from './pages/PartnerPortal';
import AdminPartners from './pages/AdminPartners';
import AdminConversions from './pages/AdminConversions';
import AdminPayoutReports from './pages/AdminPayoutReports';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/scan/:code" element={<ScanSticker />} />
      <Route path="*" element={null} />
    </Routes>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Check if we're on a public scan route
  const isScanRoute = window.location.pathname.startsWith('/scan/');
  const isGetStartedRoute = window.location.pathname.startsWith('/get-started');
  const isLiabilityRoute = window.location.pathname.startsWith('/liability');
  const isPricingRoute = window.location.pathname.startsWith('/Pricing') || window.location.pathname.startsWith('/pricing');
  const isDriverProfileRoute = window.location.pathname.startsWith('/driver-profile');
  const isPartnerSignupRoute = window.location.pathname.startsWith('/partner-signup');
  const isStudentDriversRoute = window.location.pathname.startsWith('/student-drivers');
  const isSeniorDriversRoute = window.location.pathname.startsWith('/senior-drivers');
  const isPartnerPortalRoute = window.location.pathname.startsWith('/PartnerPortal');

  const isPublicRoute = isScanRoute || isGetStartedRoute || isLiabilityRoute || isPricingRoute || isDriverProfileRoute || isPartnerSignupRoute || isStudentDriversRoute || isSeniorDriversRoute || isPartnerPortalRoute;

  // Always render public routes immediately — no auth gate, no loading spinner
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/scan/:code" element={<ScanSticker />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/liability" element={<Liability />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/driver-profile" element={<DriverProfile />} />
        <Route path="/partner-signup" element={<PartnerSignup />} />
        <Route path="/student-drivers" element={<StudentDrivers />} />
        <Route path="/senior-drivers" element={<SeniorDrivers />} />
        <Route path="/PartnerPortal" element={<PartnerPortal />} />
      </Routes>
    );
  }

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      if (!isPublicRoute) {
        navigateToLogin();
        return null;
      }
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route element={<DashboardLayout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/MapView" element={<MapView />} />
        <Route path="/Stickers" element={<Stickers />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/PreviewScan" element={<PreviewScan />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/Reporting" element={<Reporting />} />
        <Route path="/FleetDashboard" element={<FleetDashboard />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/Support" element={<Support />} />
        <Route path="/AdminUsers" element={<AdminUsers />} />
        <Route path="/AdminPartners" element={<AdminPartners />} />
        <Route path="/AdminConversions" element={<AdminConversions />} />
        <Route path="/AdminPayoutReports" element={<AdminPayoutReports />} />
        <Route path="/Leaderboard" element={<Leaderboard />} />
      </Route>
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/liability" element={<Liability />} />
      <Route path="/driver-profile" element={<DriverProfile />} />
      <Route path="/partner-signup" element={<PartnerSignup />} />
      <Route path="/student-drivers" element={<StudentDrivers />} />
      <Route path="/senior-drivers" element={<SeniorDrivers />} />
      <Route path="/PartnerPortal" element={<PartnerPortal />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App