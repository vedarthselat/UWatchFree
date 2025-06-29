import NavBar from "../Navbar/NavBar";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator";
import Movie from "../Movies/Movie";
import "./Completed_Watchlist.css";

export default function Completed_Watchlist() {
  const [movies, setMovies] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ loading state
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const BASE_URL = "https://uwatchfree-4.onrender.com/api/completedwatchlist/";

  async function getMovies() {
    try {
      setLoading(true); // start loading
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const watchlist = data["completedWatchList"];

      const formattedMovies = watchlist
        .map((item) => {
          const movieData = item.movie_id;
          if (!movieData) return null;

          return {
            _id: movieData._id,
            title: movieData.title,
            tagline: movieData.tagline,
            vote_average: movieData.vote_average,
            poster: movieData.poster,
            type: "completedwatchlist",
            completedWatchlistId: item._id,
            times_watched: item.times_watched,
            rating: item.rating,
          };
        })
        .filter(Boolean);

      setMovies(formattedMovies);
      setSearchPerformed(false);
    } catch (error) {
      console.error("Error fetching completed watchlist movies:", error);
    } finally {
      setLoading(false); // end loading
    }
  }

  async function getSearchResults(query) {
    if (!query.trim()) {
      await getMovies();
      return;
    }

    setSearchPerformed(true);

    try {
      setLoading(true); // start loading
      const response = await fetch(`${BASE_URL}search/${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setMovies([]);
        return;
      }

      const data = await response.json();

      const formattedMovies = data
        .map((item) => {
          const movieData = item.movie_id;
          if (!movieData) return null;

          return {
            _id: movieData._id,
            title: movieData.title,
            tagline: movieData.tagline,
            vote_average: movieData.vote_average,
            poster: movieData.poster,
            type: "completedwatchlist",
            completedWatchlistId: item._id,
            times_watched: item.times_watched,
            rating: item.rating,
          };
        })
        .filter(Boolean);

      setMovies(formattedMovies);
    } catch (error) {
      console.error("Error searching completed watchlist movies:", error);
      setMovies([]);
    } finally {
      setLoading(false); // end loading
    }
  }

  useEffect(() => {
    getMovies();
  }, []);

  function handleClick(movieID) {
    navigate(`/completed_watchlist/${movieID}`);
  }

  return (
    <>
      <header>
        <NavBar getSearchResults={getSearchResults} />
      </header>
      <main className="completed-page">
        <div className="center-wrapper">
          <h1 className="completed-title">Movie History</h1>
        </div>

        <div className="content-wrapper">
          {loading ? (
            <p className="empty-message">Loading...</p>
          ) : searchPerformed && movies.length === 0 ? (
            <p className="empty-message" style={{ color: "red" }}>
              Sorry, no matching movie exists in your completed watchlist.
            </p>
          ) : movies.length === 0 ? (
            <p className="empty-message">No movies found.</p>
          ) : (
            <div className="completed-grid">
              {movies.map((movie) => (
                <div key={movie._id} onClick={() => handleClick(movie._id)}>
                  <Movie movie={movie} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
