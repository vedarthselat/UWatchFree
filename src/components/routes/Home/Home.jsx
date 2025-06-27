import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Navbar/NavBar";
import Movie from "../Movies/Movie";
import "./Home.css";

const BASE_URL = "http://localhost:4000/api/movies/";

function Home() {
  const [movies, setMovies] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigate = useNavigate();

  function bufferToBase64(buffer) {
    const binary = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');
    return window.btoa(binary);
  }

  async function getMovies() {
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
      setSearchPerformed(false); // Reset flag
    } catch (error) {
      console.error("Error fetching movies:", error);
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
    try {
      const response = await fetch(`http://localhost:4000/api/movies/${encodeURIComponent(titleEntered)}`);
      const data = await response.json();

      const transformedMovies = Array.isArray(data) ? data.map((movie) => {
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
      }) : [];

      setMovies(transformedMovies);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setMovies([]); // Ensure it's empty on error
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
      <main>
        <h1 className="home-heading">Home Page</h1>
        {searchPerformed && movies.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.2rem", color: "red" }}>
            Sorry, no such movie exists.
          </p>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <div key={movie._id} className="movie-card" onClick={() => handleClick(movie._id)}>
                <Movie movie={{ ...movie, type: "home" }} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
