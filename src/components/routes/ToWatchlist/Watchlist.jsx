import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator";
import NavBar from "../Navbar/NavBar";
import Movie from "../Movies/Movie";

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [priority, setPriority] = useState("None");

  const useAuth = useContext(AuthContext);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:4000/api/towatchlist";

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  }

  async function getMovies() {
    try {
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: {
          "auth-token": useAuth.token,
          "Content-Type": "Application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const watchlist = await response.json();

      // Fix the poster image (convert buffer to base64)
      const formatted = watchlist.map((entry) => {
        const movie = entry.movie_id;
        const bufferData = movie.poster?.data?.data || [];
        const contentType = movie.poster?.contentType || "image/jpeg";
        const base64 = arrayBufferToBase64(bufferData);
        const posterUrl = `data:${contentType};base64,${base64}`;

        return {
          ...movie,
          poster: posterUrl,
          _id: entry._id, // For removing or navigating
          priority: entry.priority,
          notes: entry.notes,
          type: "watchList"
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
      <main>
        <h1 className="text-3xl font-bold text-center my-4">Watchlist</h1>
        <div className="text-center my-4">
          <label htmlFor="priority-select" className="font-bold mr-2">
            Filter by Priority:
          </label>
          <select
            id="priority-select"
            value={priority}
            onChange={handlePriorityChange}
            className="border p-2 rounded"
          >
            <option value="None">None</option>
            {[...Array(10).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                Priority {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {filteredMovies.map((movie) => (
            <div key={movie._id} onClick={() => handleClick(movie._id)}>
              <Movie
                movie={movie}
                onRemove={() => handleRemoveFromState(movie._id)}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
