import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Authenticator/Authenticator";

export default function WatchMovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [formData, setFormData] = useState({ priority: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const { APIKey } = useContext(AuthContext);
  const [priority, setPriority] = useState();

  useEffect(() => {
    // (From Matt): potential work around for not having an endpoint for a single
    // towatchlist entry: get _all_ entries and use .find to get the one we care about:
    
    fetch('https://loki.trentu.ca/~vedarthselat/3430/assn/assn2-arpanarora227/api/towatchlist/entries', {
        method: "GET",
        headers: {
            "X-API-KEY": APIKey,
            "Content-Type": "Application/json",
        },
    })
        .then(response => response.json())
        .then(data => {
            const entries = data["User's toWatchList"];
            const thisMovie = entries.find(movie => movie.id == id);
            console.log('this movie is', thisMovie);
            setPriority(thisMovie.priority);
        });
    

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
        const data = await response.json();
        setMovie(data[`Info of movie of id ${id}`]);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }

    getMovieDetails();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    const priorityValue = Number(formData.priority);
    if (!formData.priority) {
      newErrors.notSet = "Please enter a priority value.";
    } else if (priorityValue < 1 || priorityValue > 10) {
      newErrors.invalid = "Priority value must be between 1 and 10.";
    }
    return newErrors;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const validationErrors = validate();
    // const formdata=new FormData(ev.target)
    const formdata = new URLSearchParams(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(
        `https://loki.trentu.ca/~vedarthselat/3430/assn/assn2-arpanarora227/api/towatchlist/entries/${id}/priority`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-API-KEY": APIKey,
          },
          body: formdata,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.Success);
      setPriority(formData.priority);
      setFormData({priority:""});
    } catch (error) {
      console.error("Error updating priority:", error);
      setMessage("Failed to update priority.");
    }
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
    setErrors({});
    setMessage(null);
  };

  if (!movie) return <div>Loading...</div>;

  const genres = JSON.parse(movie.genres)
    .map((genre) => genre.name)
    .join(", ");
  const productionCompanies = JSON.parse(movie.production_companies)
    .map((company) => company.name)
    .join(", ");

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Movie Poster */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-64 h-auto rounded shadow-lg"
        />

        {/* Movie Details */}
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
            <strong>Priority:</strong> {priority} 
          </p>
          <a
            href={movie.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Official Website
          </a>

          {/* Priority Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            <div>
              <input
                type="number"
                name="priority"
                id="priority"
                placeholder="Enter priority here"
                value={formData.priority || ""}
                onChange={handleChange}
                className="border-4 border-solid border-[#ff8800] rounded-full p-2 w-64 text-black"
              />
              <br />
              {errors.notSet && (
                <span style={{ color: "red" }}>{errors.notSet}</span>
              )}
              {errors.invalid && (
                <span style={{ color: "red" }}>{errors.invalid}</span>
              )}
              {message && <span style={{ color: "green" }}>{message}</span>}
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 transition"
            >
              Update Priority
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
