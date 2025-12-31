import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/AgregarProductos";
import Inscripcion from "./pages/Inscripcion";
import ProductsList from './pages/ProductsList';
import ManageProducts from "./pages/ManageProducts";
import SalesDashboard from "./pages/SalesDashboard";
import PublicProductsList from "./pages/PublicProductList";
import PedidosDashboard from "./pages/PedidosDashboard";
import ReportesDashboard from './pages/ReportesDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inscripcion" element={<Inscripcion />} />
      <Route path="/productos" element={<PublicProductsList />} />
      {/* Rutas del Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/sales" element={<SalesDashboard />} />
      <Route path="/dashboard/products" element={<ProductsList />} />
      <Route path="/dashboard/add-product" element={<Dashboard />} />
      <Route path="/dashboard/manage-products" element={<ManageProducts />} />
      <Route path="/dashboard/pedidos" element={<PedidosDashboard />} />
      <Route path="/dashboard/reportes" element={<ReportesDashboard />} />
    </Routes>
  );
}

export default App;
