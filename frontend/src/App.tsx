import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Elements } from '@stripe/react-stripe-js';
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ConversationProvider } from "@/contexts/ConversationContext";
import stripePromise from "@/lib/stripe";
import "./styles/chat.css";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerRegister from "./pages/auth/CustomerRegister";
import ProviderLogin from "./pages/auth/ProviderLogin";
import ProviderRegister from "./pages/auth/ProviderRegister";
import ProviderProfile from './pages/provider/ProviderProfile';
import NewService from './pages/provider/NewService';
import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/payment/PaymentPage';
import AllCategories from './pages/services/AllCategories';
import AllProviders from './pages/providers/AllProviders';
import About from './pages/About';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import ProviderDashboard from './pages/dashboard/ProviderDashboard';
import EditProfile from './pages/profile/EditProfile';
import NotificationsSettings from './pages/settings/NotificationsSettings';
import ChangePassword from './pages/settings/ChangePassword';
import ChatPage from './pages/ChatPage';

// Protected Route Component
const ProtectedRoute = ({ children, type }: { children: React.ReactNode; type: 'customer' | 'provider' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={type === 'customer' ? '/login' : '/provider/login'} />;
  }

  if (user?.type !== type) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Flexible Protected Route Component
const FlexibleProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ConversationProvider>
          <Elements stripe={stripePromise}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<CustomerLogin />} />
                <Route path="/register" element={<CustomerRegister />} />
                <Route path="/provider/login" element={<ProviderLogin />} />
                <Route path="/provider/register" element={<ProviderRegister />} />
                <Route path="/provider/:id" element={<ProviderProfile />} />
                <Route path="/booking/:id" element={<BookingPage />} />
                <Route path="/payment/:bookingId" element={<PaymentPage />} />
                <Route path="/services" element={<AllCategories />} />
                <Route path="/providers" element={<AllProviders />} />
                <Route path="/booking/success" element={<div className="min-h-screen flex items-center justify-center"><div className="bg-white p-8 rounded-lg shadow text-center"><h2 className="text-2xl font-bold mb-4">تم الحجز بنجاح!</h2><p className="text-gray-700">شكراً لاستخدامك منصتنا. سيتم التواصل معك قريباً لتأكيد الحجز.</p></div></div>} />
                <Route path="/about" element={<About />} />
                
                {/* Chat Route */}
                <Route
                  path="/chat"
                  element={
                    <FlexibleProtectedRoute>
                      <ChatPage />
                    </FlexibleProtectedRoute>
                  }
                />
                
                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute type="customer">
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/dashboard"
                  element={
                    <ProtectedRoute type="provider">
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/services/new"
                  element={
                    <ProtectedRoute type="provider">
                      <NewService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <FlexibleProtectedRoute>
                      <EditProfile />
                    </FlexibleProtectedRoute>
                  }
                />
                <Route
                  path="/settings/notifications"
                  element={
                    <FlexibleProtectedRoute>
                      <NotificationsSettings />
                    </FlexibleProtectedRoute>
                  }
                />
                <Route
                  path="/settings/change-password"
                  element={
                    <FlexibleProtectedRoute>
                      <ChangePassword />
                    </FlexibleProtectedRoute>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </Elements>
        </ConversationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
