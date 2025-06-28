import NavBar from "../Navbar/NavBar";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator";
import Movie from "../Movies/Movie";
import "./Completed_Watchlist.css";

export default function Completed_Watchlist() {
  const [movies, setMovies] = useState([]);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:4000/api/completedwatchlist/";

  async function getMovies() {
    try {
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const watchlist = data["completedWatchList"];

      const formattedMovies = watchlist
        .map((item) => {
          const movieData = item.movie_id;

          if (!movieData) {
            console.warn("No movie data found in item:", item);
            return null;
          }

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
      console.error("Error fetching completed watchlist movies:", error);
    }
  }

  // 🔍 SEARCH HANDLER FUNCTION
  async function getSearchResults(query) {
    if (!query) {
      getMovies(); // reset to full list if query is empty
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}search/${query}`, {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setMovies([]); // if 404 or error, show nothing
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
      <main className="completed-watchlist-main">
        <h1 className="watchlist-title1">Completed Watchlist</h1>

        {movies.length === 0 ? (
          <p className="no-movies-msg">No movies found.</p>
        ) : (
          <div className="movie-grid2">
            {movies.map((movie) => (
              <div key={movie._id} onClick={() => handleClick(movie._id)}>
                <Movie movie={movie} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
