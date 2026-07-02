import { HashRouter, Routes, Route, Navigate } from "react-router"
import { useSidecar } from "./hooks/use-sidecar"
import { LoginPage } from "./pages/login-page"
import { HomePage } from "./pages/home-page"
import { PatientsPage } from "./pages/patients-page"
import { PatientDetailPage } from "./pages/patient-detail-page"
import { VisitsPage } from "./pages/visits-page"
import { VisitPage } from "./pages/visit-page"
import { ReportsPage } from "./pages/reports-page"
import { SettingsPage } from "./pages/settings-page"
import { MainLayout } from "./components/main-layout"
import { ProtectedRoute } from "./components/protected-route"

function App() {
  useSidecar()

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/visits/new" element={<VisitPage />} />
          <Route path="/visits/:visitId" element={<VisitPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
