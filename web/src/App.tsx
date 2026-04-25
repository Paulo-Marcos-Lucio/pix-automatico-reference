import { Navigate, Route, Routes, useParams } from "react-router-dom";
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
        <Route index element={<Navigate to="/painel" replace />} />
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/consentimentos" element={<Consents />} />
        <Route path="/consentimentos/:id" element={<ConsentDetail />} />
        <Route path="/assinaturas" element={<Subscriptions />} />
        <Route path="/cobrancas" element={<Charges />} />
        <Route path="/cobrancas/:id" element={<ChargeDetail />} />
        <Route path="/notificacoes" element={<Webhooks />} />
        {/* Compatibilidade: rotas antigas em inglês redirecionam pras novas */}
        <Route path="/dashboard" element={<Navigate to="/painel" replace />} />
        <Route path="/consents" element={<Navigate to="/consentimentos" replace />} />
        <Route path="/consents/:id" element={<RedirectWithParam base="/consentimentos" />} />
        <Route path="/subscriptions" element={<Navigate to="/assinaturas" replace />} />
        <Route path="/charges" element={<Navigate to="/cobrancas" replace />} />
        <Route path="/charges/:id" element={<RedirectWithParam base="/cobrancas" />} />
        <Route path="/webhooks" element={<Navigate to="/notificacoes" replace />} />
        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Route>
    </Routes>
  );
}

function RedirectWithParam({ base }: { base: string }) {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`${base}/${id}`} replace />;
}
