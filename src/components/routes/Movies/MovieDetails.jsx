// MovieDetails.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./MovieDetails.css";
import NavBar from "../Navbar/NavBar";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [posterUrl, setPosterUrl] = useState("");

  function bufferToBase64(buffer) {
    if (!buffer || buffer.length === 0) return "";
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`https://uwatchfree-4.onrender.com/api/movies/id/${id}`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setMovie(data);

        const buf = data.poster?.data?.data;
        const ct = data.poster?.contentType || "image/jpeg";

        if (buf && Array.isArray(buf)) {
          setPosterUrl(`data:${ct};base64,${bufferToBase64(buf)}`);
        }

        console.log("Fetched movie data:", data);
      } catch (e) {
        console.error("Error loading movie:", e);
      }
    }

    if (id) load();
  }, [id]);

  if (!movie) return <p>Loading movie details...</p>;

  return (
    <>
    <NavBar/>
    <div className="movie-container">
      <div className="movie-content">
        {posterUrl && (
          <img src={posterUrl} alt={movie.title} className="movie-poster" />
        )}
        <div className="movie-details">
          <h1 className="movie-title1">{movie.title || "No Title Available"}</h1>
          <p className="movie-tagline">{movie.tagline || "No Tagline Provided"}</p>
          <p className="movie-overview"><strong>Genre:</strong> {movie.genre || "N/A"}</p>
          <p className="movie-overview"><strong>Runtime:</strong> {movie.rutime ? `${movie.rutime} min` : "N/A"}</p>
          <a
            href={movie.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="movie-link"
          >
            Official Website
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
