import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator";
import "./Movie.css";

function Movie({ movie, onRemove }) {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [click, setClick] = useState({
    clicked: false,
    alreadyExists: false,
    alreadyWatched: false,
  });

  async function handleClick(ev) {
    ev.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/towatchlist/${movie._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ priority: 5 }),
        }
      );

      const data = await response.json();
      console.log("Watchlist response:", data);

      if (response.status === 201 && data.message === "Movie added to watchlist") {
        setClick({ clicked: true, alreadyExists: false, alreadyWatched: false });
        setTimeout(() => setClick({ clicked: false, alreadyExists: false, alreadyWatched: false }), 2000);
      } else if (response.status === 200 && data.message === "Movie already exists in your to-watch list.") {
        setClick({ clicked: true, alreadyExists: true, alreadyWatched: false });
      } else if (response.status === 200 && data.message === "Movie already exists in completed watchlist — skipping towatchlist.") {
        setClick({ clicked: true, alreadyExists: false, alreadyWatched: true });
      }
    } catch (error) {
      console.error("Failed to add to watchlist", error);
    }
  }

  async function handleRemove(ev) {
    ev.stopPropagation();
    try {
      const response = await fetch(
        `http://localhost:4000/api/towatchlist/${movie.movie_id}`,
        {
          method: "DELETE",
          headers: {
            "auth-token": token,
          },
        }
      );

      const data = await response.json();
      console.log(data);

      if (response.status === 200 && data.message === "Movie removed from your watchlist") {
        onRemove(movie._id);
      } else {
        alert(data.error || "Failed to remove movie!");
      }
    } catch (error) {
      console.error("Failed to remove from watchlist", error);
    }
  }

  function handleMarkAsWatched(ev) {
    ev.stopPropagation();
    navigate(`/completedwatchlist/${movie.movie_id}`);
  }

  function handleCardClick() {
    if (movie.type === "completedwatchlist") {
      navigate(`/completed_watchlist/${movie._id}`);
    }
  }

  // ✅ Safe Poster Handling for All Pages
  let posterSrc = "https://via.placeholder.com/300x450?text=No+Image";

  if (typeof movie.poster === "string") {
    posterSrc = movie.poster;
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
      posterSrc = `data:${movie.poster.contentType};base64,${base64String}`;
    } catch (err) {
      console.error("Poster buffer error:", err);
    }
  }

  return (
    <div className="movie-card" onClick={handleCardClick}>
      <div className="movie-img-wrapper">
        <img src={posterSrc} alt={movie.title} className="movie-img" />

        {movie.type !== "completedwatchlist" && (
          <>
            {movie.type === "watchList" ? (
              <button
                className={`movie-button top-button ${
                  click.clicked
                    ? click.alreadyExists
                      ? "gray"
                      : "green pulse"
                    : "blue"
                }`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleMarkAsWatched(ev);
                }}
              >
                {click.clicked ? "Marked as Watched" : "Mark as Watched"}
              </button>
            ) : (
              <button
                className={`movie-button top-button ${
                  click.clicked
                    ? click.alreadyWatched || click.alreadyExists
                      ? "gray"
                      : "green pulse"
                    : "blue"
                }`}
                onClick={(ev) => {
                  if (!click.alreadyExists && !click.alreadyWatched) {
                    handleClick(ev);
                  } else {
                    ev.stopPropagation();
                  }
                }}
                disabled={click.alreadyExists || click.alreadyWatched}
              >
                {click.clicked
                  ? click.alreadyWatched
                    ? "Movie already watched"
                    : click.alreadyExists
                    ? "Movie already added"
                    : "✓"
                  : "+"}
              </button>
            )}
          </>
        )}
      </div>

      <h2 className="movie-title">{movie.title}</h2>
      <p className="movie-tagline">{movie.tagline}</p>
      <p className="movie-rating">Vote Average: {movie.vote_average}/10</p>

      {movie.rating && (
        <p className="movie-rating">
          <strong>Your Rating:</strong> {movie.rating}/10
        </p>
      )}

      {movie.priority && (
        <p>
          <strong>Priority:</strong> {movie.priority}
        </p>
      )}

      {movie.type === "watchList" && (
        <button className="movie-button bottom-button red" onClick={handleRemove}>
          Remove
        </button>
      )}

      {movie.type === "completedwatchlist" && (
        <p className="movie-watch-count">
          <strong>Times Watched:</strong> {movie.times_watched}
        </p>
      )}
    </div>
  );
}

export default Movie;