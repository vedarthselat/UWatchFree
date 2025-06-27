import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator";
import NavBar from "../Navbar/NavBar";
import Movie from "../Movies/Movie";
import "./Watchlist.css";

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [priority, setPriority] = useState("None");

  const useAuth = useContext(AuthContext);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:4000/api/towatchlist";

  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  }

  async function getMovies() {
    try {
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: {
          "auth-token": useAuth.token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const watchlist = await response.json();

      const formatted = watchlist.map((entry) => {
        const movie = entry.movie_id;
        const bufferData = movie.poster?.data?.data || [];
        const contentType = movie.poster?.contentType || "image/jpeg";
        const base64 = arrayBufferToBase64(bufferData);
        const posterUrl = `data:${contentType};base64,${base64}`;

        return {
          ...movie,
          movie_id: movie._id, // ✅ Actual movie ID used for DELETE
          poster: posterUrl,
          _id: entry._id, // towatchlist entry ID
          priority: entry.priority,
          notes: entry.notes,
          type: "watchList",
        };
      });

      setMovies(formatted);
      setFilteredMovies(formatted);
    } catch (error) {
      console.error("Error fetching watchlist movies:", error);
    }
  }

  function handlePriorityChange(e) {
    const selectedPriority = e.target.value;
    setPriority(selectedPriority);
    if (selectedPriority === "None") {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(movies.filter((movie) => movie.priority === Number(selectedPriority)));
    }
  }

  function handleClick(movieID) {
    navigate(`/watchlist/${movieID}`);
  }

  function handleRemoveFromState(movieID) {
    setMovies((prev) => prev.filter((movie) => movie._id !== movieID));
    setFilteredMovies((prev) => prev.filter((movie) => movie._id !== movieID));
  }

  useEffect(() => {
    getMovies();
  }, []);

  useEffect(() => {
    if (priority === "None") {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(movies.filter((movie) => movie.priority === Number(priority)));
    }
  }, [priority, movies]);

  return (
    <>
      <header>
        <NavBar />
      </header>
      <main className="watchlist-page">
        <div className="center-wrapper">
          <h1 className="watchlist-header">Watchlist</h1>

          <div className="filter-container">
            <label htmlFor="priority-select" className="filter-label">
              Filter by Priority:
            </label>
            <select
              id="priority-select"
              value={priority}
              onChange={handlePriorityChange}
              className="filter-select"
            >
              <option value="None">None</option>
              {[...Array(10).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Priority {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="content-wrapper">
          {filteredMovies.length === 0 ? (
            <p className="empty-message">No movies found for the selected priority.</p>
          ) : (
            <div className="movies-grid">
              {filteredMovies.map((movie) => (
                <div key={movie._id} onClick={() => handleClick(movie._id)}>
                  <Movie movie={movie} onRemove={() => handleRemoveFromState(movie._id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
