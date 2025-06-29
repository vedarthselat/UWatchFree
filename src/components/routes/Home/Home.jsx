import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import NavBar from "../Navbar/NavBar";
import Movie from "../Movies/Movie";
import "./Home.css";

const BASE_URL = "https://uwatchfree-4.onrender.com/api/movies/";

function Home() {
  const [movies, setMovies] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function bufferToBase64(buffer) {
    const binary = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');
    return window.btoa(binary);
  }

  async function getMovies() {
    setLoading(true);
    try {
      const response = await fetch(BASE_URL);
      const data = await response.json();

      const transformedMovies = data.map((movie) => {
        const imageBuffer = movie.poster?.data?.data;
        const contentType = movie.poster?.contentType || "image/jpeg";
        let posterUrl = "";

        if (imageBuffer && Array.isArray(imageBuffer)) {
          const base64String = bufferToBase64(imageBuffer);
          posterUrl = `data:${contentType};base64,${base64String}`;
        }

        return {
          ...movie,
          poster: posterUrl,
        };
      });

      setMovies(transformedMovies);
      setSearchPerformed(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getMovies();
  }, []);

  async function getSearchResults(titleEntered) {
    if (titleEntered === "") {
      await getMovies();
      return;
    }

    setSearchPerformed(true);
    setLoading(true);
    try {
      const response = await fetch(`https://uwatchfree-4.onrender.com/api/movies/${encodeURIComponent(titleEntered)}`);
      const data = await response.json();

      const transformedMovies = Array.isArray(data)
        ? data.map((movie) => {
            const imageBuffer = movie.poster?.data?.data;
            const contentType = movie.poster?.contentType || "image/jpeg";
            let posterUrl = "";

            if (imageBuffer && Array.isArray(imageBuffer)) {
              const base64String = bufferToBase64(imageBuffer);
              posterUrl = `data:${contentType};base64,${base64String}`;
            }

            return {
              ...movie,
              poster: posterUrl,
            };
          })
        : [];

      setMovies(transformedMovies);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }

  function handleClick(movieID) {
    navigate(`/movies/${movieID}`);
  }

  return (
    <>
      <header>
        <NavBar getSearchResults={getSearchResults} />
      </header>
      <main className="home-page">
        <div className="center-wrapper">
          <h1 className="home-heading">Home Page</h1>
        </div>

        <div className="content-wrapper">
          {loading ? (
            <p className="status-message">Loading...</p>
          ) : searchPerformed && movies.length === 0 ? (
            <p className="status-message" style={{ color: "red" }}>
              Sorry, no such movie exists.
            </p>
          ) : movies.length === 0 ? (
            <p className="status-message">No movies available.</p>
          ) : (
            <div className="movie-grid">
              {movies.map((movie) => (
                <div key={movie._id} className="movie-card" onClick={() => handleClick(movie._id)}>
                  <Movie movie={{ ...movie, type: "home" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Only show the Add Movie banner when loading is done */}
        {!loading && (
          <div className="add-movie-banner">
            <p className="banner-text">🎬 Couldn’t find the movie you’re looking for?</p>
            <NavLink to="/addMovie" className="banner-link">➕ Add it now!</NavLink>
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
