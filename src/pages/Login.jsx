import { useState } from "react";
import "../styles/Login.css"; // puedes crear carpeta styles/Login.css
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Usuarios autorizados
  const privateUsers = [
    { email: "usuario1@ejemplo.com", password: "1234" },
    { email: "usuario2@ejemplo.com", password: "1234" },
    { email: "usuario3@ejemplo.com", password: "1234" },
    { email: "usuario4@ejemplo.com", password: "1234" },
    { email: "usuario5@ejemplo.com", password: "1234" },
    { email: "usuario6@ejemplo.com", password: "1234" },
    { email: "usuario7@ejemplo.com", password: "1234" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const user = privateUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      navigate("/dashboard"); // va a la zona privada
    } else {
      setError("Usuario no autorizado");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

