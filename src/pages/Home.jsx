import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "../App.css";
import "../styles/Ganadores.css";
import "../styles/Encabezado.css";
import "../styles/Global.css";
import "../styles/NavVar.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useNavigate } from "react-router-dom";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "../styles/ProductosSection.css"; // Agrega esta línea al inicio

function Home() {
  const navigate = useNavigate();

  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  // ========== WARMING REQUEST - Despertar el backend ==========
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        // Hacer un request silencioso al backend para despertarlo
        await axios.get(`${process.env.REACT_APP_API_URL}/api/health`, {
          timeout: 30000, // 30 segundos de timeout
        });
        console.log("Backend despertado exitosamente");
      } catch (error) {
        // Silenciosamente ignorar errores - el objetivo es solo despertar el servidor
        console.log("Warming request completado");
      }
    };

    // Ejecutar inmediatamente al montar el componente
    wakeUpBackend();
  }, []); // Array vacío = solo se ejecuta una vez al montar
  // ============================================================

  useEffect(() => {
    const map = L.map("map").setView([10.0821389, -83.3479722], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([10.0821389, -83.3479722])
      .addTo(map)
      .bindPopup("¡Bienvenido a la Sala de juegos!")
      .openPopup();

    return () => {
      map.remove();
    };
  }, []);

  const handleInscribir = (torneoNombre) => {
    navigate("/inscripcion", {
      state: { torneo: torneoNombre },
    });
  };

  return (
    <>
      <div>
        {/* Navegación */}
        <nav className="navbar navbar-expand-lg navbar-dar">
          <div className="container">
            <span className="navbar-brand">Sala de Juegos Ruiz</span>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto mb-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/productos">
                    Productos en Venta
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        {/* Encabezado */}
        <header className="hero-accent">
          <div className="hero-image"></div>

          <div className="hero-content">
            <div className="hero-logo">
              <img
                src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318752/Imagen_de_WhatsApp_2025-01-11_a_las_21.53.16_f15972d6_h3rx20.jpg"
                alt="Sala de Juegos Ruiz"
              />
            </div>

            <h1 className="fade-up">Sala de Juegos Ruiz</h1>
            <p className="fade-up delay-1">
              Centro de entretenimiento y recreación
            </p>
            <p className="fade-up delay-1">
              Un lugar seguro y confiable para divertirse sanamente
            </p>
          </div>
        </header>
        {/* sobre sala de juegos */}
        <section id="about" className="bg-custom py-5">
          <div className="container">
            <div className="row mb-5">
              <div className="col-12 shadow rounded text-center">
                <h2 className="text-primary mt-4">
                  Descubre la Diversión en la Sala de Juegos
                </h2>
                <p className="mt-4 text-muted">
                  Nuestra sala de juegos ofrece una experiencia única para todos
                  los amantes del entretenimiento. Contamos con una amplia
                  variedad de opciones, desde clásicos como ping pong, futbolín
                  y máquinas tragamonedas, hasta lo último en tecnología con
                  consolas de videojuegos como PlayStation. Aquí encontrarás el
                  equilibrio perfecto entre tradición y modernidad, ideal para
                  disfrutar con amigos, familiares o para desafiar a otros
                  jugadores. ¡Ven y vive momentos inolvidables en un ambiente
                  lleno de diversión y emoción!
                </p>
              </div>
            </div>

            {/* Vision y Misión */}
            <div className="row">
              {/* Vision */}
              <div className="col-md-6 mb-4">
                <div className="p-4 shadow rounded text-center">
                  <h2 className="text-primary">Visión</h2>
                  <p className="mt-4 text-muted">
                    Ser el centro de entretenimiento líder, proporcionando
                    experiencias únicas a nuestros jugadores, creando un espacio
                    donde todos puedan disfrutar, aprender y conectar con otros
                    a través del juego.
                  </p>
                </div>
              </div>

              {/* Misión */}
              <div className="col-md-6 mb-4">
                <div className="p-4 shadow rounded text-center">
                  <h2 className="text-primary">Misión</h2>
                  <p className="mt-4 text-muted">
                    Ofrecer un ambiente seguro, inclusivo y emocionante donde
                    los jugadores puedan disfrutar de una amplia gama de juegos
                    de calidad, fomentando la competencia sana y el trabajo en
                    equipo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Galeria */}
        <section id="gallery" className="bg-custom py-5">
          <div className="container">
            <h2 className="text-center mb-3">Galería de la Sala</h2>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="gallery-item">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318751/Imagen_de_WhatsApp_2025-01-11_a_las_13.22.39_99fdc2cc_t6qlpv.jpg"
                    alt="Sala de Juegos - Imagen 1"
                    className="img-fluid rounded shadow"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="gallery-item">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318751/Imagen_de_WhatsApp_2025-01-11_a_las_13.22.39_87a85618_k91ytj.jpg"
                    alt="Sala de Juegos - Imagen 2"
                    className="img-fluid rounded shadow"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="gallery-item">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318752/Imagen_de_WhatsApp_2025-01-11_a_las_15.52.13_c45a1601_xdrq2d.jpg"
                    alt="Sala de Juegos - Imagen 3"
                    className="img-fluid rounded shadow"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-4">
                  <div className="gallery-item">
                    <img
                      src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318752/Imagen_de_WhatsApp_2025-01-11_a_las_15.51.25_2855bfb0_np5fr6.jpg"
                      alt="Sala de Juegos - Imagen 4"
                      className="img-fluid rounded shadow"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="col-md-4 mb-4">
                  <div className="gallery-item">
                    <img
                      src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318753/Imagen_de_WhatsApp_2025-01-12_a_las_13.45.03_d0eb2b26_pqtwyh.jpg"
                      alt="Sala de Juegos - Imagen 5"
                      className="img-fluid rounded shadow"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Productos en Venta - Sección Genérica y Versátil */}
        <section id="productos-venta" className="bg-custom py-5">
          <div className="container">
            <h2 className="text-center mb-4">🛍️ Productos en Venta</h2>
            <p className="text-center text-muted mb-5">
              Descubre nuestra variedad de productos disponibles en la sala
            </p>

            <div className="row align-items-center">
              {/* Imagen destacada */}
              <div className="col-md-6 mb-4">
                <div className="position-relative">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1767141336/carrito_lpapvi.png"
                    alt="Productos disponibles"
                    className="img-fluid rounded shadow-lg"
                    style={{
                      width: "100%",
                      height: "400px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="text-center text-white">
                      <i
                        className="bi bi-shop"
                        style={{ fontSize: "4rem" }}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información y CTA */}
              <div className="col-md-6 mb-4">
                <div className="p-4">
                  <h3 className="mb-4">
                    <i className="bi bi-cart-check text-primary"></i> Nuestra
                    Tienda
                  </h3>

                  <div className="mb-4">
                    <div className="d-flex align-items-start mb-3">
                      <i
                        className="bi bi-check-circle-fill text-success me-3 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <h5 className="mb-1">Gran Variedad de Productos</h5>
                        <p className="text-muted mb-0">
                          Snacks, bebidas, entretenimiento y más
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <i
                        className="bi bi-check-circle-fill text-success me-3 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <h5 className="mb-1">Siempre Disponible</h5>
                        <p className="text-muted mb-0">
                          Stock actualizado regularmente
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <i
                        className="bi bi-check-circle-fill text-success me-3 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <h5 className="mb-1">Precios Justos</h5>
                        <p className="text-muted mb-0">
                          Las mejores ofertas de la zona
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <i
                        className="bi bi-check-circle-fill text-success me-3 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <h5 className="mb-1">Fácil Acceso</h5>
                        <p className="text-muted mb-0">
                          Compra directamente en la sala
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-3">
                    <Link
                      to="/productos"
                      className="btn btn-primary btn-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        padding: "15px 30px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                      }}
                    >
                      <i className="bi bi-shop me-2"></i>
                      Ver Catálogo Completo
                    </Link>

                    <p className="text-center text-muted mb-0">
                      <i className="bi bi-geo-alt me-2"></i>
                      Visítanos en la sala para ver más productos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Categorías destacadas - MÁS GENÉRICAS */}
            <div className="row mt-5">
              <div className="col-md-3 col-6 mb-3">
                <Link to="/productos" className="text-decoration-none">
                  <div className="text-center p-3 bg-white rounded shadow-sm h-100 hover-card">
                    <i
                      className="bi bi-controller text-primary"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h6 className="mt-3 mb-0">Consolas & Juegos</h6>
                  </div>
                </Link>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <Link to="/productos" className="text-decoration-none">
                  <div className="text-center p-3 bg-white rounded shadow-sm h-100 hover-card">
                    <i
                      className="bi bi-headphones text-primary"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h6 className="mt-3 mb-0">Accesorios</h6>
                  </div>
                </Link>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <Link to="/productos" className="text-decoration-none">
                  <div className="text-center p-3 bg-white rounded shadow-sm h-100 hover-card">
                    <i
                      className="bi bi-box-seam text-primary"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h6 className="mt-3 mb-0">Productos Varios</h6>
                  </div>
                </Link>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <Link to="/productos" className="text-decoration-none">
                  <div className="text-center p-3 bg-white rounded shadow-sm h-100 hover-card">
                    <i
                      className="bi bi-stars text-primary"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h6 className="mt-3 mb-0">Destacados</h6>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <style jsx>{`
          .hover-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
          }
        `}</style>
        {/* Juegos disponibles*/}
        <section id="games" className="bg-custom py-5">
          <div className="container">
            <h2 className="text-center mb-4">Los Mejores Juegos Disponibles</h2>
            <div className="row text-center mb-4">
              {/* Juego 1 */}
              <div className="col-md-3 mb-3">
                <a
                  href="https://www.playstation.com/es-es/ps-plus/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318750/Captura_de_pantalla_2025-01-11_145419_hgy4zv.png"
                    alt="Juego 1"
                    className="img-fluid rounded mb-3"
                    loading="lazy"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <p>Call of Duty Black Ops 6</p>
                </a>
              </div>

              {/* Juego 2 */}
              <div className="col-md-3 mb-3">
                <a
                  href="https://www.playstation.com/es-es/ps-plus/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318430/Captura_de_pantalla_2025-01-11_145112_vwsdp4.png"
                    alt="Juego 2"
                    loading="lazy"
                    className="img-fluid rounded mb-3"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <p>Grand theft Auto Five</p>
                </a>
              </div>

              {/* Juego 3*/}
              <div className="col-md-3 mb-3">
                <a
                  href="https://www.playstation.com/es-es/ps-plus/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1766698701/EA-Sports-FC-26-Release-Date-and-Gameplay-Reveal_pqy8fq.jpg"
                    alt="Juego 3"
                    loading="lazy"
                    className="img-fluid rounded mb-3"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <p>EAFC26</p>
                </a>
              </div>

              {/* Juego 4 */}
              <div className="col-md-3 mb-3">
                <a
                  href="https://www.playstation.com/es-es/ps-plus/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318750/Captura_de_pantalla_2025-01-11_150001_nj4eyj.png"
                    alt="Juego 4"
                    loading="lazy"
                    className="img-fluid rounded mb-3"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <p>Mortal Kombat 1</p>
                </a>
              </div>
              {/* Segunda parte */}
              <div className="row text-center mb-4">
                {/* juego 1 */}
                <div className="col-md-3 mb-3">
                  <a
                    href="https://www.playstation.com/es-es/ps-plus/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318751/Dragon-Ball-Sparking-Zero_pk60kl.png"
                      alt="Juego 5"
                      loading="lazy"
                      className="img-fluid rounded mb-3"
                      style={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    <p>Dragon Ball Sparking Zero</p>
                  </a>
                </div>
              </div>
            </div>

            {/* Enlace PSplus */}
            <div className="text-center">
              <a
                href="https://www.playstation.com/es-es/ps-plus/games/?category=GAME_CATALOG#plus-container"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver todos los juegos en PS Plus
              </a>
            </div>
          </div>
        </section>
        {/* Ganadores de Torneos */}
        <section id="ganadores" className="bg-custom py-5">
          <div className="container">
            <h2 className="text-center mb-4">Ganadores de Torneos</h2>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded text-center card-verde">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318751/Imagen_de_WhatsApp_2025-01-11_a_las_13.22.39_079f8747_whbol2.jpg"
                    alt="Ganador Torneo Fifa 2025"
                    loading="lazy"
                    className="img-fluid rounded-circle mb-3"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                  <h4 className="mb-2 text-white">Deisler Flores</h4>
                  <p className="text-white">
                    Tricampeón del Torneo EAFC 2022, 2023 y 2025
                  </p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded text-center card-azul">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318751/Imagen_de_WhatsApp_2025-01-11_a_las_13.22.39_a023594b_uflphn.jpg"
                    alt="Ganador Battle Royale Challenge"
                    loading="lazy"
                    className="img-fluid rounded-circle mb-3"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                  <h4 className="mb-2 text-white">Deikel</h4>
                  <p className="text-white">Campeón del Call Of Duty 2023</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded text-center card-roja">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1766697890/Vargas_hdccso.jpg"
                    alt="Ganador Torneo Fifa 2025"
                    loading="lazy"
                    className="img-fluid rounded-circle mb-3"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                  <h4 className="mb-2 text-white">Vargas</h4>
                  <p className="text-white">Campeón de Mortal Kombat 1 2025</p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded text-center card-amarillo">
                  <img
                    src="https://res.cloudinary.com/drjsg8j92/image/upload/v1766697970/isacar_hfuauy.jpg"
                    alt="Ganador Torneo Fifa 2025"
                    loading="lazy"
                    className="img-fluid rounded-circle mb-3"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                  <h4 className="mb-2 text-white">Isacar</h4>
                  <p className="text-white">Campeón de Call of Duty 2025</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Insercion de torneos */}
        <section id="tournaments" className="bg-custom py-5">
          <div className="container">
            <h2 className="text-center mb-4">
              Inscripción de Torneos y Competiciones
            </h2>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded">
                  <h4 className="mb-3">🎮Torneo EAFC 2026</h4>
                  <p>
                    Torneo competitivo de fútbol virtual enfocado en
                    rendimiento, estrategia y precisión en cada partido.
                  </p>
                  <p>Fecha: Por definir</p>
                  <p>Valor: ₡2000</p>
                  <button
                    className="btn btn-success"
                    onClick={() => handleInscribir("Torneo de EAFC")}
                  >
                    Inscribirse
                  </button>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded">
                  <h4 className="mb-3">⚔️Call Of Duty</h4>
                  <p>
                    Únete al Torneo Call of Duty y demuestra tu destreza en
                    combates intensos. Estrategia y reacción rápida marcan la
                    diferencia.
                  </p>
                  <p>Fecha: Por definir</p>
                  <p>Valor: ₡1000</p>
                  <button
                    className="btn btn-success"
                    onClick={() => handleInscribir("Torneo Call of Dutty")}
                  >
                    Inscribirse
                  </button>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded">
                  <h4 className="mb-3">🌀Naruto</h4>
                  <p>
                    Competencia de combates uno contra uno basada en
                    habilidades, táctica y dominio de personajes.
                  </p>
                  <p>Fecha: Por definir</p>
                  <p>Valor: ₡1000</p>
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      handleInscribir("Torneo de Naruto Shippuden")
                    }
                  >
                    Inscribirse
                  </button>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="p-3 shadow rounded">
                  <h4 className="mb-3">🥋Mortal Kombat 1</h4>
                  <p>
                    Torneo de lucha directa donde la técnica, el control y la
                    toma de decisiones son determinantes.
                  </p>
                  <p>Fecha: Por definir</p>
                  <p>Valor: ₡1000</p>
                  <button
                    className="btn btn-success"
                    onClick={() => handleInscribir("Torneo Mortal Kombat 1")}
                  >
                    Inscribirse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Mapa */}
        <section id="mapa" className="bg-custom py-5">
          <div className="container">
            <h2 className="text-center mb-4">Ubicación de la Sala de Juegos</h2>
            <p className="text-center mb-4">
              Visítanos en nuestra sala ubicada en el corazón de la ciudad para
              disfrutar de los mejores momentos de juego.
            </p>

            {/* Contenedor del mapa con clase bootstrap para responsividad */}
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div
                  className="map-container"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%", //500px Aseguramos una altura específica para el mapa
                    maxWidth: "800px",
                    margin: "0 auto", // Centra el mapa si no se llena toda la pantalla
                  }}
                >
                  {/* Este es el ultimo mapa container que renderiza */}
                  <div
                    id="map"
                    style={{
                      height: "50vh", //50vh Ocupa toda la altura disponible del contenedor
                      width: "100%", // Ocupa toda la anchura disponible
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Contacto */}
        <section id="contact" className="bg-primary py-5">
          <div className="container text-white">
            <h2 className="text-center mb-4">Contáctanos</h2>
            <p className="text-center">
              Si deseas más información sobre nuestra sala de juegos, o deseas
              reservar, no dudes en contactarnos.
            </p>
            <div className="text-center my-4">
              <a href="tel:86825481" className="btn btn-light mx-2">
                <i className="bi bi-telephone"></i> Llámanos
              </a>

              <a
                href="mailto:salajuegosruiz@gmail.com"
                className="btn btn-light mx-2"
              >
                <i className="bi bi-envelope"></i> Envíanos un correo
              </a>
            </div>
            <div className="text-center mt-4">
              <p className="mb-2">
                <strong>Teléfono:</strong>{" "}
                <a
                  href="tel:86825481"
                  className="text-white text-decoration-underline"
                >
                  86825481 o 84237787
                </a>
              </p>
              <p className="mb-4">
                <strong>Correo:</strong>{" "}
                <a
                  href="mailto:salajuegosruiz@gmail.com"
                  className="text-white text-decoration-underline"
                >
                  salajuegosruiz@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>
        {/* Pie de pagina */}
        <footer className="bg-dark text-white text-center py-3">
          <p className="mb-0">
            &copy; 2025 Sala de Juegos. Todos los derechos reservados.
          </p>
          <p className="mb-0">
            Proyecto realizado por <strong>Jefernee Ruiz</strong>
          </p>
          <p className="mb-0">
            Contacto:{" "}
            <a href="mailto:jefernee50@gmail.com" className="text-white">
              jefernee50@gmail.com
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}

export default Home;
