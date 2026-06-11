import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import AdminSales from './pages/AdminSales';
import FleetDrivers from './pages/FleetDrivers';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PartnerTerms from './pages/PartnerTerms';
import AdminFleetReferrals from './pages/AdminFleetReferrals';
import AdminStickers from './pages/AdminStickers';
import AdminAnalytics from './pages/AdminAnalytics';
import Claim from './pages/Claim';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';


const AuthenticatedApp = () => {
  const { user, authError } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  // Subdomain routing
  if (window.location.hostname === 'fleet.judgemydriving.com') return <FleetDrivers />;
  if (window.location.hostname === 'teens.judgemydriving.com') return <StudentDrivers />;
  if (window.location.hostname === 'seniors.judgemydriving.com') return <SeniorDrivers />;

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Redirect partner role to their portal (still gated behind ProtectedRoute below)
  const partnerRoutes = user?.role === 'partner' ? (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/PartnerPortal" element={<PartnerPortal />} />
        <Route path="*" element={<Navigate to="/PartnerPortal" replace />} />
      </Route>
    </Routes>
  ) : null;

  if (partnerRoutes) return partnerRoutes;

  return (
    <Routes>
      {/* Auth pages — always public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public marketing / scan pages — no auth required */}
      <Route path="/scan/:code" element={<ScanSticker />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/liability" element={<Liability />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/driver-profile" element={<DriverProfile />} />
      <Route path="/partner-signup" element={<PartnerSignup />} />
      <Route path="/student-drivers" element={<StudentDrivers />} />
      <Route path="/senior-drivers" element={<SeniorDrivers />} />
      <Route path="/PartnerPortal" element={<PartnerPortal />} />
      <Route path="/fleet-drivers" element={<FleetDrivers />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/partner-terms" element={<PartnerTerms />} />
      <Route path="/claim" element={<Claim />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={<Navigate to={user?.plan_tier ? "/Dashboard" : "/Pricing"} replace />} />
        <Route element={<DashboardLayout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/MapView" element={<MapView />} />
          <Route path="/Stickers" element={<Stickers />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/PreviewScan" element={<PreviewScan />} />
          <Route path="/Analytics" element={<Analytics />} />
          <Route path="/Reporting" element={<Reporting />} />
          <Route path="/FleetDashboard" element={<FleetDashboard />} />
          <Route path="/Support" element={<Support />} />
          <Route path="/AdminUsers" element={<AdminUsers />} />
          <Route path="/AdminPartners" element={<AdminPartners />} />
          <Route path="/AdminConversions" element={<AdminConversions />} />
          <Route path="/AdminPayoutReports" element={<AdminPayoutReports />} />
          <Route path="/AdminSales" element={<AdminSales />} />
          <Route path="/AdminFleetReferrals" element={<AdminFleetReferrals />} />
          <Route path="/AdminStickers" element={<AdminStickers />} />
          <Route path="/AdminAnalytics" element={<AdminAnalytics />} />
          <Route path="/Leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>

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