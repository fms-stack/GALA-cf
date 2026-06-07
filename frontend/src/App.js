import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { CustomCursor } from "@/components/CustomCursor";
import { AmbientAudio } from "@/components/AmbientAudio";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Home from "@/pages/public/Home";
import Concept from "@/pages/public/Concept";
import Prix from "@/pages/public/Prix";
import Partenaires from "@/pages/public/Partenaires";
import RSVP from "@/pages/public/RSVP";
import Contact from "@/pages/public/Contact";
import Candidatures from "@/pages/public/Candidatures";
import Casting from "@/pages/public/Casting";
import Sponsoring from "@/pages/public/Sponsoring";
import Billetterie, { BilletterieSuccess } from "@/pages/public/Billetterie";
import SurInvitation from "@/pages/public/SurInvitation";
import FoundersCircle from "@/pages/public/FoundersCircle";
import CercleRestreint from "@/pages/public/CercleRestreint";
import Mecenat, { MecenatSuccess } from "@/pages/public/Mecenat";
import Login from "@/pages/admin/Login";
import MagicLink from "@/pages/admin/MagicLink";
import Dashboard from "@/pages/admin/Dashboard";
import Positions from "@/pages/admin/Positions";
import People from "@/pages/admin/People";
import Assignments from "@/pages/admin/Assignments";
import Invitations from "@/pages/admin/Invitations";
import Submissions from "@/pages/admin/Submissions";
import Contracts from "@/pages/admin/Contracts";
import Bible from "@/pages/admin/Bible";
import "@/App.css";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-foreground">Chargement…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <I18nProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC — dark editorial */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/concept" element={<Concept />} />
              <Route path="/prix" element={<Prix />} />
              <Route path="/partenaires" element={<Partenaires />} />
              <Route path="/rsvp" element={<RSVP />} />
              <Route path="/billetterie" element={<Billetterie />} />
              <Route path="/billetterie/success" element={<BilletterieSuccess />} />
              <Route path="/sur-invitation" element={<SurInvitation />} />
              <Route path="/founders-circle" element={<FoundersCircle />} />
              <Route path="/cercle-restreint" element={<CercleRestreint />} />
              <Route path="/mecenat" element={<Mecenat />} />
              <Route path="/mecenat/success" element={<MecenatSuccess />} />
              <Route path="/candidatures" element={<Candidatures />} />
              <Route path="/casting" element={<Casting />} />
              <Route path="/sponsoring" element={<Sponsoring />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* BACK-OFFICE — light dense */}
            <Route path="/login" element={<Login />} />
            <Route path="/portail" element={<MagicLink />} />
            <Route element={<Protected><AdminLayout /></Protected>}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/positions" element={<Positions />} />
              <Route path="/admin/people" element={<People />} />
              <Route path="/admin/assignments" element={<Assignments />} />
              <Route path="/admin/invitations" element={<Invitations />} />
              <Route path="/admin/submissions" element={<Submissions />} />
              <Route path="/admin/contracts" element={<Contracts />} />
              <Route path="/admin/bible" element={<Bible />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
          <CustomCursor />
          <AmbientAudio src={process.env.REACT_APP_AMBIENT_AUDIO_URL} />
        </BrowserRouter>
        </I18nProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
