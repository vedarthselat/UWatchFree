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
            poster: movieData.poster, // ✅ poster object
            type: "completedwatchlist",
            completedWatchlistId: item._id,
            times_watched: item.times_watched,
            rating: item.rating,
          };
        })
        .filter(Boolean); // Removes nulls
      setMovies(formattedMovies);
    } catch (error) {
      console.error("Error fetching completed watchlist movies:", error);
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
        <NavBar />
      </header>
      <main className="completed-watchlist-main">
        <h1 className="watchlist-title1">Completed Watchlist</h1>
        <div className="movie-grid2">
          {movies.map((movie) => (
            <div key={movie._id} onClick={() => handleClick(movie._id)}>
              <Movie movie={movie} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
