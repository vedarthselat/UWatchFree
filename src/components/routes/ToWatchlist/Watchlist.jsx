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
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(true); // 🔁 Loading state

  const useAuth = useContext(AuthContext);
  const navigate = useNavigate();
  const BASE_URL = "https://uwatchfree-4.onrender.com/api/towatchlist";

  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  }

  async function getMovies() {
    try {
      setLoading(true);
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
          movie_id: movie._id,
          poster: posterUrl,
          _id: entry._id,
          priority: entry.priority,
          notes: entry.notes,
          type: "watchList",
        };
      });

      setMovies(formatted);
      setFilteredMovies(formatted);
      setSearchPerformed(false);
    } catch (error) {
      console.error("Error fetching watchlist movies:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getSearchResults(titleEntered) {
    if (titleEntered.trim() === "") {
      await getMovies();
      return;
    }

    setSearchPerformed(true);
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(titleEntered)}`, {
        headers: {
          "auth-token": useAuth.token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setFilteredMovies([]);
        return;
      }

      const results = await response.json();

      const formatted = results.map((entry) => {
        const movie = entry.movie_id;
        const bufferData = movie.poster?.data?.data || [];
        const contentType = movie.poster?.contentType || "image/jpeg";
        const base64 = arrayBufferToBase64(bufferData);
        const posterUrl = `data:${contentType};base64,${base64}`;

        return {
          ...movie,
          movie_id: movie._id,
          poster: posterUrl,
          _id: entry._id,
          priority: entry.priority,
          notes: entry.notes,
          type: "watchList",
        };
      });

      setMovies(formatted);
      if (priority === "None") {
        setFilteredMovies(formatted);
      } else {
        setFilteredMovies(formatted.filter((movie) => movie.priority === Number(priority)));
      }
    } catch (error) {
      console.error("Error during watchlist search:", error);
      setFilteredMovies([]);
    } finally {
      setLoading(false);
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
        <NavBar getSearchResults={getSearchResults} />
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
          {loading ? (
            <p className="empty-message">Loading...</p>
          ) : searchPerformed && filteredMovies.length === 0 ? (
            <p className="empty-message" style={{ color: "red" }}>
              Sorry, no matching movie exists in your watchlist.
            </p>
          ) : filteredMovies.length === 0 ? (
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
