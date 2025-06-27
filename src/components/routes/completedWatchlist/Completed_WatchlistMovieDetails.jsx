import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Authenticator/Authenticator";

export default function CompletedMovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [message, setMessage] = useState(null);
  const { token } = useContext(AuthContext);
  const [timesWatched, setTimesWatched] = useState(0);

  useEffect(() => {
    async function fetchMovieData() {

      try {
        const response = await fetch(
          `http://localhost:4000/api/completedwatchlist/`,
          {
            method: "GET",
            headers: {
              "auth-token": APIKey,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const entries = data["User's completedWatchList"];

        // Ensure type match between id (string) and movie.id (number)
        const thisMovie = entries?.find((movie) => movie.id === Number(id));

        if (thisMovie) {
          // Explicitly set timesWatched, defaulting to 0 if not found
          setTimesWatched(thisMovie.times_watched || 0);
          console.log("Times watched:" + timesWatched);
        } else {
          console.warn("Movie not found in completed watchlist.");
          setTimesWatched(0);
        }
      } catch (error) {
        console.error("Error fetching completed watchlist movie:", error);
        setTimesWatched(0);
      }


    }

    async function getMovieDetails() {
      try {
        const response = await fetch(
          `https://loki.trentu.ca/~vedarthselat/3430/assn/assn2-arpanarora227/api/movies/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMovie(data[`Info of movie of id ${id}`]);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }

    // Call both functions when component mounts
    Promise.all([fetchMovieData(), getMovieDetails()]);
  }, [id, APIKey]);

  const handleIncrement = async () => {
    try {
      const response = await fetch(
        `https://loki.trentu.ca/~vedarthselat/3430/assn/assn2-arpanarora227/api/completedwatchlist/entries/${id}/times-watched`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-API-KEY": APIKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.Success);
      setTimesWatched((prev) => prev + 1);
    } catch (error) {
      console.error("Error incrementing times watched:", error);
      setMessage("Failed to update the value.");
    }
  };

  if (!movie) return <div>Loading...</div>;

  const genres = JSON.parse(movie.genres || "[]")
    .map((genre) => genre.name)
    .join(", ");
  const productionCompanies = JSON.parse(movie.production_companies || "[]")
    .map((company) => company.name)
    .join(", ");

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-64 h-auto rounded shadow-lg"
        />

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="text-sm italic text-gray-500">{movie.tagline}</p>
          <p className="text-lg">{movie.overview}</p>
          <p className="text-sm text-gray-700">
            <strong>Genres:</strong> {genres}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Release Date:</strong> {movie.release_date}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Runtime:</strong> {movie.runtime} minutes
          </p>
          <p className="text-sm text-gray-700">
            <strong>Average Rating:</strong> {movie.vote_average}/10 (
            {movie.vote_count} votes)
          </p>
          <p className="text-sm text-gray-700">
            <strong>Revenue:</strong> ${Number(movie.revenue).toLocaleString()}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Budget:</strong> ${Number(movie.budget).toLocaleString()}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Production Companies:</strong> {productionCompanies}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Times Watched:</strong> {timesWatched}
          </p>
          <button
            onClick={handleIncrement}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 transition"
          >
            Increment Times Watched
          </button>
          {message && <span style={{ color: "green" }}>{message}</span>}
        </div>
      </div>
    </div>
  );
}