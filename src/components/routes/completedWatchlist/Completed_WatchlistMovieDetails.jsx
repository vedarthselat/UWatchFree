import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Authenticator/Authenticator";
import "./Completed_WatchlistMovieDetails.css"; 
import NavBar from "../Navbar/NavBar";

export default function CompletedMovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [message, setMessage] = useState(null);
  const { token } = useContext(AuthContext);
  const [timesWatched, setTimesWatched] = useState(0);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchCompletedWatchlistData() {
      try {
        const response = await fetch(
          `http://localhost:4000/api/completedwatchlist/`,
          {
            method: "GET",
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Full API response:", data);
        const entries = data["completedWatchList"];
        console.log("Entries:", entries);
        console.log("Looking for ID:", id);

        const thisMovieEntry = entries?.find((entry) => {
          console.log("Checking entry._id:", entry._id, "against id:", id);
          return String(entry._id) === String(id);
        });

        if (thisMovieEntry) {
          console.log("Found movie entry:", thisMovieEntry);
          console.log("Movie data from entry:", thisMovieEntry.movie_id);
          setMovie(thisMovieEntry.movie_id);
          setTimesWatched(thisMovieEntry.times_watched || 0);
          setRating(thisMovieEntry.rating || 0);
          setNotes(thisMovieEntry.notes || "");
        } else {
          console.log("Entry not found, trying fallback...");
          const fallbackEntry = entries?.find((entry) => {
            console.log("Checking entry.movie_id._id:", entry.movie_id._id, "against id:", id);
            return String(entry.movie_id._id) === String(id);
          });

          if (fallbackEntry) {
            console.log("Found fallback entry:", fallbackEntry);
            console.log("Movie data from fallback:", fallbackEntry.movie_id);
            setMovie(fallbackEntry.movie_id);
            setTimesWatched(fallbackEntry.times_watched || 0);
            setRating(fallbackEntry.rating || 0);
            setNotes(fallbackEntry.notes || "");
          } else {
            console.log("No movie found at all!");
          }
        }
      } catch (error) {
        console.error("Error fetching completed watchlist data:", error);
      }
    }

    fetchCompletedWatchlistData();
  }, [id, token]);

  const handleIncrement = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/completedwatchlist/entries/${id}/times-watched`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.Success || data.message);
      setTimesWatched((prev) => prev + 1);
    } catch (error) {
      console.error("Error incrementing times watched:", error);
      setMessage("Failed to update the value.");
    }
  };

  const getPosterSrc = () => {
    if (!movie?.poster) return "https://via.placeholder.com/300x450?text=No+Image";

    if (typeof movie.poster === "string") {
      return movie.poster;
    } else if (
      movie.poster?.data?.data &&
      Array.isArray(movie.poster.data.data) &&
      movie.poster.contentType
    ) {
      try {
        const byteArray = new Uint8Array(movie.poster.data.data);
        let binary = "";
        for (let i = 0; i < byteArray.length; i++) {
          binary += String.fromCharCode(byteArray[i]);
        }
        const base64String = btoa(binary);
        return `data:${movie.poster.contentType};base64,${base64String}`;
      } catch (err) {
        console.error("Poster buffer error:", err);
        return "https://via.placeholder.com/300x450?text=No+Image";
      }
    }
    return "https://via.placeholder.com/300x450?text=No+Image";
  };

  console.log("Current movie state:", movie);

  if (!movie) {
    return (
      <div className="completed-watchlist-movie-details-wrapper">
        <div className="completed-watchlist-loading-state">Loading movie details...</div>
      </div>
    );
  }

  return (
    <>
    <NavBar />
    <div className="completed-watchlist-movie-details-wrapper">
      <div className="completed-watchlist-movie-display-container">
        <div className="completed-watchlist-poster-section">
          <img
            src={getPosterSrc()}
            alt={movie.title || "Movie poster"}
            className="completed-watchlist-movie-poster-image"
          />
        </div>

        <div className="completed-watchlist-movie-information-panel">
          <h1 className="completed-watchlist-movie-main-title">{movie.title || "No title available"}</h1>
          <p className="completed-watchlist-movie-tagline-text">{movie.tagline || "No tagline available"}</p>

          <div className="completed-watchlist-movie-details-grid-layout">
            <div className="completed-watchlist-detail-info-block">
              <span className="completed-watchlist-detail-field-label">Genre:</span>
              <span className="completed-watchlist-detail-field-value">{movie.genre || "No genre available"}</span>
            </div>
            <div className="completed-watchlist-detail-info-block">
              <span className="completed-watchlist-detail-field-label">Runtime:</span>
              <span className="completed-watchlist-detail-field-value">{movie.rutime || "No runtime available"} minutes</span>
            </div>
            <div className="completed-watchlist-detail-info-block">
              <span className="completed-watchlist-detail-field-label">Average Rating:</span>
              <span className="completed-watchlist-detail-field-value">{movie.vote_average || "No rating"}/10 ({movie.vote_count || 0} votes)</span>
            </div>
            <div className="completed-watchlist-detail-info-block">
              <span className="completed-watchlist-detail-field-label">Your Rating:</span>
              <span className="completed-watchlist-detail-field-value">{rating}/10</span>
            </div>
            <div className="completed-watchlist-detail-info-block">
              <span className="completed-watchlist-detail-field-label">Times Watched:</span>
              <span className="completed-watchlist-detail-field-value">{timesWatched}</span>
            </div>
          </div>

          <div className="completed-watchlist-actions-control-panel">
            <button onClick={handleIncrement} className="completed-watchlist-increment-times-watched-btn">
              Increment Times Watched
            </button>

            {message && <div className="completed-watchlist-success-message-display">{message}</div>}

            {movie.homepage && (
              <a
                href={movie.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="completed-watchlist-movie-homepage-link"
              >
                Visit Movie Homepage
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}