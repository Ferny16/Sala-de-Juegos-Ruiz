import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1>Bienvenido al Dashboard</h1>
      <p>Solo los usuarios autorizados pueden ver esta sección.</p>
      <Link to="/">Volver al Home</Link>
    </div>
  );
}

