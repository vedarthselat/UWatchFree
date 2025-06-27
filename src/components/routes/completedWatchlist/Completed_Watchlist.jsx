import NavBar from "../Navbar/NavBar";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator";
import Movie from "../Movies/Movie";

export default function Completed_Watchlist() {
  const [movies, setMovies] = useState([]); // Stores all fetched movies
  const useAuth = useContext(AuthContext);
  const navigate = useNavigate();
  const APIKey = useAuth.token;
  const BASE_URL =
    "https://loki.trentu.ca/~vedarthselat/3430/assn/assn2-arpanarora227/api/completedwatchlist/entries";

  // Fetch the completed watchlist movies
  async function getMovies() {
    try {
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: {
          "X-API-KEY": APIKey,
          "Content-Type": "Application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const watchlist = data["User's completedWatchList"];
      setMovies(watchlist);
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
      <main>
        <h1 className="text-3xl font-bold text-center my-4">Completed Watchlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {movies.map((movie) => (
            <div key={movie.id} onClick={() => handleClick(movie.id)}>
              <Movie movie={{...movie, 
                type:"completedwatchlist"}} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}