import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Authenticator/Authenticator";
import "./WatchMovieDetails.css";

function bufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default function WatchMovieDetails() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [formData, setFormData] = useState({ priority: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const useAuth = useContext(AuthContext);
  const token = useAuth.token;

  useEffect(() => {
    async function fetchEntry() {
      try {
        const response = await fetch(`http://localhost:4000/api/towatchlist`, {
          method: "GET",
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        const thisEntry = data.find((item) => item._id === id);
        if (thisEntry) {
          setEntry(thisEntry);
        }
      } catch (err) {
        console.error("Error fetching to-watchlist:", err);
      }
    }

    fetchEntry();
  }, [id, token]);

  const validate = () => {
    const newErrors = {};
    const priorityValue = Number(formData.priority);
    if (!formData.priority) {
      newErrors.notSet = "Please enter a priority value.";
    } else if (priorityValue < 1 || priorityValue > 10) {
      newErrors.invalid = "Priority must be between 1 and 10.";
    }
    return newErrors;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const movieId = entry.movie_id._id || entry.movie_id; // ✅ Critical fix here

      const response = await fetch(
        `http://localhost:4000/api/towatchlist/${movieId}/priority`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ priority: formData.priority }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      setMessage(data.message);
      setEntry((prev) => ({ ...prev, priority: formData.priority }));
      setFormData({ priority: "" });
    } catch (error) {
      console.error("Error updating priority:", error);
      setMessage("Failed to update priority.");
    }
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
    setErrors({});
    setMessage(null);
  };

  if (!entry) return <div className="loading">Loading...</div>;
  if (!entry.movie_id) return <div className="loading">No movie data found...</div>;

  const movie = entry.movie_id;

  let posterUrl = "fallback.jpg";
  if (movie.poster && movie.poster.data && movie.poster.data.data && movie.poster.contentType) {
    try {
      posterUrl = `data:${movie.poster.contentType};base64,${bufferToBase64(movie.poster.data.data)}`;
    } catch (e) {
      console.error("Poster image error:", e);
    }
  }

  return (
    <div className="watch-details-container1">
      <div className="movie-details1">
        <img src={posterUrl} alt="Movie Poster" className="movie-poster1" />

        <div className="movie-info1">
          <h1 className="movie-title1">{movie.title || "Untitled"}</h1>

          {movie.tagline && <p className="movie-tagline1">"{movie.tagline}"</p>}

          <p><strong>Genre:</strong> {movie.genre || "N/A"}</p>
          <p><strong>Runtime:</strong> {movie.rutime || "N/A"} minutes</p>
          <p><strong>Average Rating:</strong> {movie.vote_average ?? "N/A"} / 10</p>
          <p><strong>Vote Count:</strong> {movie.vote_count ?? "N/A"}</p>
          <p><strong>Priority:</strong> {entry.priority}</p>

          {movie.homepage && (
            <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="movie-link">
              Visit Official Website
            </a>
          )}

          <form onSubmit={handleSubmit} className="priority-form">
            <input
              type="number"
              name="priority"
              id="priority"
              placeholder="Enter priority (1-10)"
              value={formData.priority}
              onChange={handleChange}
              className="priority-input"
            />
            <br />
            {errors.notSet && <span className="error">{errors.notSet}</span>}
            {errors.invalid && <span className="error">{errors.invalid}</span>}
            {message && <span className="success">{message}</span>}
            <br />
            <button type="submit" className="submit-btn">Update Priority</button>
          </form>
        </div>
      </div>
    </div>
  );
}
