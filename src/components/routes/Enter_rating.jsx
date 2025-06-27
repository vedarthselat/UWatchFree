import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./Authenticator/Authenticator";
import "./Enter_rating.css";
import NavBar from "./Navbar/NavBar";

export default function Enter_rating() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [formData, setFormData] = useState({ rating: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const { token } = useContext(AuthContext);
  const [rating, setScore] = useState("N/A");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  }

  async function getMovieDetails() {
    try {
      console.log("Fetching movie details for ID:", id);
      const response = await fetch(`http://localhost:4000/api/movies/id/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Movie API Response:", data);

      // Handle poster image
      let posterUrl = "fallback.jpg"; // Default fallback
      if (data.poster?.data?.data && data.poster?.contentType) {
        try {
          const bufferData = data.poster.data.data;
          const contentType = data.poster.contentType;
          const base64 = arrayBufferToBase64(bufferData);
          posterUrl = `data:${contentType};base64,${base64}`;
        } catch (posterError) {
          console.error("Error processing poster:", posterError);
        }
      }

      // Set movie data with processed poster
      setMovie({ 
        ...data, 
        poster: posterUrl,
        // Ensure all fields are properly set with fallbacks
        title: data.title || "Untitled Movie",
        tagline: data.tagline || "",
        genre: data.genre || "Unknown",
        rutime: data.rutime || data.runtime || "Unknown", // Handle both possible field names
        vote_average: data.vote_average || "N/A",
        vote_count: data.vote_count || "N/A",
        homepage: data.homepage || ""
      });

    } catch (error) {
      console.error("Error fetching movie details:", error);
      setError("Failed to load movie details");
    }
  }

  async function getUserRating() {
    try {
      const response = await fetch('http://localhost:4000/api/towatchlist', {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json", // Fixed typo: Application -> application
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Watchlist API Response:", data);

      const entries = data;
      const thisMovie = entries.find((movie) => movie.movie_id == id);
      setScore(thisMovie?.rating || "N/A");
    } catch (error) {
      console.error("Error fetching user rating:", error);
      // Don't set error state for this as it's not critical
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      // Fetch both movie details and user rating
      await Promise.all([
        getMovieDetails(),
        getUserRating()
      ]);

      setLoading(false);
    }

    if (id && token) {
      fetchData();
    }
  }, [id, token]);

  const validate = () => {
    const newErrors = {};
    const ratingValue = Number(formData.rating);
    if (!formData.rating) {
      newErrors.notSet = "Please enter a rating value.";
    } else if (ratingValue < 1 || ratingValue > 10) {
      newErrors.invalid = "Score value must be between 1 and 10.";
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
      const response = await fetch(
        `http://localhost:4000/api/completedwatchlist/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ rating: formData.rating }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.message) {
        setMessage("Rating submitted successfully!");
        setTimeout(() => {
          navigate("/completed_watchlist");
        }, 1500);
      } else {
        setMessage("Failed to submit rating.");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      setMessage("Failed to update rating.");
    }
  };
  

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
    setErrors({});
    setMessage(null);
  };

  if (loading) return <div className="loading">Loading movie details...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!movie) return <div className="error-message">No movie data found</div>;

  return (
    <>
    <NavBar />
    <div className="rating-container">
      <div className="rating-flex">
        <img
          src={movie.poster}
          alt={movie.title}
          className="rating-poster"
          onError={(e) => {
            e.target.src = "fallback.jpg"; // Fallback if poster fails to load
          }}
        />
        <div className="rating-details">
          <h1 className="movie-title">{movie.title}</h1>
          
          {movie.tagline && (
            <p className="tagline">"{movie.tagline}"</p>
          )}
          
          {movie.genre && (
            <p><strong>Genres:</strong> {movie.genre}</p>
          )}
          
          {movie.rutime && movie.rutime !== "Unknown" && (
            <p><strong>Runtime:</strong> {movie.rutime} minutes</p>
          )}
          
          <p><strong>Average Rating:</strong> {movie.vote_average}/10</p>
          <p><strong>Total Votes:</strong> {movie.vote_count}</p>
          <p><strong>Your Score:</strong> {rating}</p>

          {movie.homepage && (
            <a 
              className="visit-link" 
              href={movie.homepage} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Visit Official Website
            </a>
          )}

          <form onSubmit={handleSubmit} className="rating-form">
            <input
              type="number"
              name="rating"
              placeholder="Enter rating here (1-10)"
              value={formData.rating || ""}
              onChange={handleChange}
              className="rating-input"
              min="1"
              max="10"
            />
            <div className="form-messages">
              {errors.notSet && <span className="error">{errors.notSet}</span>}
              {errors.invalid && <span className="error">{errors.invalid}</span>}
              {message && <span className="success">{message}</span>}
            </div>
            <button type="submit" className="submit-btn">
              Enter Rating
            </button>
          </form>
        </div>
      </div>


    </div>
    </>
  );
}