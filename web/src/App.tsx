import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Consents from "@/pages/Consents";
import ConsentDetail from "@/pages/ConsentDetail";
import Subscriptions from "@/pages/Subscriptions";
import Charges from "@/pages/Charges";
import ChargeDetail from "@/pages/ChargeDetail";
import Webhooks from "@/pages/Webhooks";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/consents" element={<Consents />} />
        <Route path="/consents/:id" element={<ConsentDetail />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/charges" element={<Charges />} />
        <Route path="/charges/:id" element={<ChargeDetail />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
