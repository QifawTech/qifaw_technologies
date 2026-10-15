import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Products from "./pages/public/Products.jsx";
import ProductDetails from "./pages/public/ProductDetails.jsx";
import Services from "./pages/public/Services.jsx";
import Careers from "./pages/public/Careers.jsx";
import JobDetails from "./pages/public/JobDetails.jsx";
import Contact from "./pages/public/Contact.jsx";
import Privacy from "./pages/public/Privacy.jsx";
import Terms from "./pages/public/Terms.jsx";
import NotFound from "./pages/public/NotFound.jsx";
import Login from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminServices from "./pages/admin/Services.jsx";
import AdminJobs from "./pages/admin/Jobs.jsx";
import AdminApplications from "./pages/admin/Applications.jsx";
import AdminEnquiries from "./pages/admin/Enquiries.jsx";
import AdminTestimonials from "./pages/admin/Testimonials.jsx";
import AdminContent from "./pages/admin/Content.jsx";
import AdminMissionVision from "./pages/admin/MissionVision.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";
import AdminChangePassword from "./pages/admin/ChangePassword.jsx";

export default function App() {
  return (
    <Routes>
      {/* ============ PUBLIC PAGES ============ */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/careers/:slug" element={<JobDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ============ ADMIN LOGIN ============ */}
      <Route path="/admin/login" element={<Login />} />

      {/* ============ ADMIN PROTECTED ============ */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="mission-vision" element={<AdminMissionVision />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="change-password" element={<AdminChangePassword />} />
      </Route>
    </Routes>
  );
}