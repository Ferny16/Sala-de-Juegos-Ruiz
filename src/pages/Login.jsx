import React from "react";

function Login() {
  return (
    <div className="container py-5">
      <h2 className="text-center">Login</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo Electrónico</label>
          <input type="email" className="form-control" id="email" required />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input type="password" className="form-control" id="password" required />
        </div>
        <button type="submit" className="btn btn-primary">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;
