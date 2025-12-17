import React from "react";
import home from "./content/home.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { useEffect } from "react";
import L from "leaflet"; // Importa Leaflet
import "leaflet/dist/leaflet.css";
import emailjs from "@emailjs/browser";
import { useState } from "react";

function App() {
  useEffect(() => {
    // Asegúrate de que el mapa solo se cree una vez
    const map = L.map("map").setView([10.0821389, -83.3479722], 13);

    // Llamada de la capa base
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Marcador en el mapa
    L.marker([10.0821389, -83.3479722])
      .addTo(map)
      .bindPopup("¡Bienvenido a la Sala de juegos!")
      .openPopup();

    // Limpiar el mapa cuando el componente se desmonta
    return () => {
      if (map) {
        map.remove(); // Esto destruye el mapa al desmontar el componente
      }
    };
  }, []);

  // Estado para mostrar/ocultar el formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para almacenar el nombre del torneo
  const [torneo, setTorneo] = useState("");
  // Estado para controlar si ya se ha enviado el formulario
  const [formSubmitted, setFormSubmitted] = useState(false); // Nueva variable de estado

  // Manejar la visibilidad del formulario y asignar el nombre del torneo
  const handleShowForm = (torneoNombre) => {
    setTorneo(torneoNombre); // Asignar el nombre del torneo
    setShowForm(true); // Hacer visible el formulario
  };

  // Parte de envío de inscripción a torneo
  const handleFormSubmit = (event) => {
    event.preventDefault();

    // Verificar si el formulario ya ha sido enviado
    if (formSubmitted) {
      alert("¡Ya estás inscrito en este torneo!");
      return;
    }

    const form = event.target;

    emailjs
      .sendForm(
        "service_836qmbb", // Tu ID del servicio
        "template_jzeg7u4", // Tu ID de la plantilla
        form,
        "kmFrqkvGQkrmmtRvU" // Tu clave pública API
      )
      .then(
        (result) => {
          console.log("Formulario enviado:", result.text);
          alert("¡Inscripción realizada con éxito!");
          setFormSubmitted(true); // Marcar como enviado
        },
        (error) => {
          console.log("Error al enviar formulario:", error.text);
          alert(
            "Hubo un problema al enviar tu inscripción. Intenta nuevamente."
          );
        }
      );
  };

  return (
    <div>
      {/* Navegación */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Sala de Juegos Ruiz</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  Sobre la Sala
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#games">
                  Juegos
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#ganadores">
                  Campeones de Torneos
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#tournaments">
                  Torneos
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#gallery">
                  Galería
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#mapa">
                  Mapa
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Anuncios */}
      {/* Encabezado */}
      <header className="App-header text-white text-center py-5">
        <div className="container ">
          <div className="text-container">
            <h1 className="display-4 typing-text">
                {home.title}
            </h1>
            <p className="lead">
                {home.description}
            </p>
          </div>
        </div>
      </header>

      {/* Sobre la Sala de Juegos */}
      <section id="about" className="bg-custom py-5">
        <div className="container">
          {/* Sobre la Sala de Juegos */}
          <div className="row mb-5">
            <div className="col-12 shadow rounded text-center">
              <h2 className="text-primary mt-4">
                Descubre la Diversión en la Sala de Juegos
              </h2>
              <p className="mt-4 text-muted">
                Nuestra sala de juegos ofrece una experiencia única para todos
                los amantes del entretenimiento. Contamos con una amplia
                variedad de opciones, desde clásicos como ping pong, futbolín y
                máquinas tragamonedas, hasta lo último en tecnología con
                consolas de videojuegos como PlayStation. Aquí encontrarás el
                equilibrio perfecto entre tradición y modernidad, ideal para
                disfrutar con amigos, familiares o para desafiar a otros
                jugadores. ¡Ven y vive momentos inolvidables en un ambiente
                lleno de diversión y emoción!
              </p>
            </div>
          </div>

          {/* Visión y Misión */}
          <div className="row">
            {/* Visión */}
            <div className="col-md-6 mb-4">
              <div className="p-4 shadow rounded text-center">
                <h2 className="text-primary">Visión</h2>
                <p className="mt-4 text-muted">
                  Ser el centro de entretenimiento líder, proporcionando
                  experiencias únicas a nuestros jugadores, creando un espacio
                  donde todos puedan disfrutar, aprender y conectar con otros a
                  través del juego.
                </p>
              </div>
            </div>

            {/* Misión */}
            <div className="col-md-6 mb-4">
              <div className="p-4 shadow rounded text-center">
                <h2 className="text-primary">Misión</h2>
                <p className="mt-4 text-muted">
                  Ofrecer un ambiente seguro, inclusivo y emocionante donde los
                  jugadores puedan disfrutar de una amplia gama de juegos de
                  calidad, fomentando la competencia sana y el trabajo en
                  equipo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Galería */}
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
      {/* Juegos Disponibles */}
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

            {/* Juego 3 */}
            <div className="col-md-3 mb-3">
              <a
                href="https://www.playstation.com/es-es/ps-plus/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318750/Captura_de_pantalla_2025-01-11_145836_em97b5.png"
                  alt="Juego 3"
                  loading="lazy"
                  className="img-fluid rounded mb-3"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <p>EAFC25</p>
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
            {/*Segunda parte*/}
            <div className="row text-center mb-4">
              {/* Juego 1 */}
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

          {/* Enlace a PS Plus */}
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
              <div className="p-3 shadow rounded text-center">
                <img
                  src="https://res.cloudinary.com/drjsg8j92/image/upload/v1737318751/Imagen_de_WhatsApp_2025-01-11_a_las_13.22.39_079f8747_whbol2.jpg"
                  alt="Ganador Torneo Fifa 2025"
                  loading="lazy"
                  className="img-fluid rounded-circle mb-3"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <h4 className="mb-2 text-white">Deisler Flores</h4>
                <p class="text-white">
                  Bicampeón del Torneo EAFC24 2023 Y 2022
                </p>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="p-3 shadow rounded text-center">
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
                <p class="text-white">Campeón del Call Of Duty 2023</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Inscripción torneos */}
      <section id="tournaments" className="bg-custom py-5">
        <div className="container">
          <h2 className="text-center mb-4">
            Inscripción de Torneos y Competiciones
          </h2>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="p-3 shadow rounded">
                <h4 className="mb-3">Torneo EAFC 2025</h4>
                <p>
                  El torneo más esperado de la temporada. ¡Demuestra tus
                  habilidades!
                </p>
                <p>Fecha: 01 Marzo 2025 Hora: 6pm</p>
                <p>Valor: $2000</p>
                <p>Simpe Movil: 86825481 jefernee Ruiz</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowForm("Torneo EAFC25")} // Actualiza el torneo y muestra el formulario
                >
                  Inscribirse
                </button>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="p-3 shadow rounded">
                <h4 className="mb-3">Battle Royale Challenge</h4>
                <p>
                  Participa en el torneo donde solo uno puede ser el campeón.
                </p>
                <p>Fecha: 30 Marzo 2025 Hora: 6pm</p>
                <p>Valor: $1000</p>
                <p>Simpe Movil: 86825481 jefernee Ruiz</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowForm("Torneo Call Of Duty")} // Actualiza el torneo y muestra el formulario
                >
                  Inscribirse
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Solo renderiza el formulario cuando `showForm` sea verdadero */}

      {showForm && (
        <form id="formulario-inscripcion" onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="torneo" className="form-label">
              Torneo
            </label>
            <input
              type="text"
              className="form-control"
              id="torneo"
              name="tournament"
              value={torneo} // Mostrar el nombre del torneo aquí
              readOnly
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Enviar Inscripción
          </button>
        </form>
      )}
      {/* Mapa */}
      <section id="mapa" className="bg-custom py-5">
        <div className="container">
          <h2 className="text-center mb-4">Ubicación de la Sala de Juegos</h2>
          <p className="text-center mb-4">
            Visítanos en nuestra sala ubicada en el corazón de la ciudad para
            disfrutar de los mejores momentos de juego.
          </p>

          {/* Contenedor del mapa con clase de Bootstrap para responsividad */}
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
                {/* Este es el único MapContainer que se renderiza */}
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
      {/* Pie de página */}
      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">
          &copy; 2025 Sala de Juegos. Todos los derechos reservados.
          <p>
            Proyecto realizado por <strong>Jefernee Ruiz</strong>
          </p>
          <p>
            Contacto:{" "}
            <a href="mailto:jefernee50@gmail.com">jefernee50@gmail.com</a>
          </p>
        </p>
      </footer>
    </div>
  );
}

export default App;
