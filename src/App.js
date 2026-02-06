import { Routes, Route } from "react-router-dom";

// Router
import AppRouter from "./components/AppRouter";

// Páginas públicas
import Home2 from "./pages/Home2";
import Login from "./pages/Login";
import Inscripcion from "./pages/Inscripcion";
import PublicProductsList from "./pages/PublicProductList";

// Dashboard
import Dashboard from "./pages/AgregarProductos";
import SalesDashboard from "./pages/SalesDashboard";
import ProductsList from "./pages/ProductsList";
import ManageProducts from "./pages/ManageProducts";
import PedidosDashboard from "./pages/PedidosDashboard";
import ReportesDashboard from "./pages/ReportesDashboard";

// import { useBackendWarmup } from "./hocks/useBackendWarmup";

function App() {
  // useBackendWarmup();

  return (
    <AppRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home2 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscripcion" element={<Inscripcion />} />
        <Route path="/productos" element={<PublicProductsList />} />

        {/* Rutas del dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/sales" element={<SalesDashboard />} />
        <Route path="/dashboard/add-product" element={<Dashboard />} />
        <Route path="/dashboard/products" element={<ProductsList />} />
        <Route path="/dashboard/manage-products" element={<ManageProducts />} />
        <Route path="/dashboard/pedidos" element={<PedidosDashboard />} />
        <Route path="/dashboard/reportes" element={<ReportesDashboard />} />
      </Routes>
    </AppRouter>
  );
}

export default App;

