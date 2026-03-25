import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/app/RequireAuth";
import { GuestOnly } from "@/app/GuestOnly";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PeopleListPage } from "@/pages/PeopleListPage";
import { PersonDetailPage } from "@/pages/PersonDetailPage";
import { PersonFormPage } from "@/pages/PersonFormPage";
import { useAuthStore } from "@/stores/authStore";

function NotFound() {
  const token = useAuthStore((s) => s.token);
  return <Navigate to={token ? "/" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="people" element={<PeopleListPage />} />
            <Route path="people/new" element={<PersonFormPage />} />
            <Route path="people/:id" element={<PersonDetailPage />} />
            <Route path="people/:id/edit" element={<PersonFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
