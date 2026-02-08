import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Router
import AppRouter from "./components/AppRouter";

// Páginas públicas
import Home2 from "./pages/Home2";
import Login from "./pages/Login";
import Inscripcion from "./pages/Inscripcion";
import PublicProductsList from "./pages/PublicProductList";

// Dashboard (lazy)
const Dashboard = lazy(() => import("./pages/AgregarProductos"));
const SalesDashboard = lazy(() => import("./pages/SalesDashboard"));
const ProductsList = lazy(() => import("./pages/ProductsList"));
const ManageProducts = lazy(() => import("./pages/ManageProducts"));
const PedidosDashboard = lazy(() => import("./pages/PedidosDashboard"));
const ReportesDashboard = lazy(() => import("./pages/ReportesDashboard"));
const PlaysManagement = lazy(() => import("./pages/PlaysManagement"));

// Loader simple mientras carga lazy components
const PageLoader = () => <div>Cargando...</div>;

function App() {
  return (
    <AppRouter>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/dashboard/plays" element={<PlaysManagement />} />
        </Routes>
      </Suspense>
    </AppRouter>
  );
}

export default App;
