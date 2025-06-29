import React, { useState, useContext } from "react";
import "./AddMovie.css";
import NavBar from "../Navbar/NavBar";
import { AuthContext } from "../Authenticator/Authenticator";

export default function AddMovie() {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    homepage: "",
    tagline: "",
    title: "",
    vote_average: "",
    rutime: "", // ✅ matches MongoDB schema
    genre: "",
    poster: null,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.homepage || !/^https?:\/\/.+\..+/.test(formData.homepage)) {
      newErrors.homepage = "Valid homepage URL required.";
    }
    if (!formData.tagline) newErrors.tagline = "Tagline is required.";
    if (!formData.title) newErrors.title = "Title is required.";
    if (!formData.vote_average || isNaN(formData.vote_average)) {
      newErrors.vote_average = "Vote average must be a number.";
    }
    if (!formData.rutime || !Number.isInteger(Number(formData.rutime))) {
      newErrors.runtime = "Runtime must be an integer.";
    }
    if (!formData.genre) newErrors.genre = "Genre is required.";

    if (!formData.poster) {
      newErrors.poster = "Poster image is required.";
    } else if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        formData.poster.type
      )
    ) {
      newErrors.poster = "Invalid file type. Only image formats allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const body = new FormData();
    for (const key in formData) {
      body.append(key, formData[key]);
    }

    try {
      const response = await fetch("https://uwatchfree-4.onrender.com/api/movies/addMovie", {
        method: "POST",
        headers: {
          "auth-token": token,
        },
        body,
      });

      const result = await response.json();
      if (result.message === "Movie added successfully!") {
        setMessage("Movie added successfully!");
        setFormData({
          homepage: "",
          tagline: "",
          title: "",
          vote_average: "",
          rutime: "", // ✅ matches schema
          genre: "",
          poster: null,
        });
        setErrors({});
      } else {
        setMessage("Failed to add the movie!");
      }
    } catch (error) {
      console.error("Error submitting movie:", error);
      setMessage("Failed to add the movie!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="add-movie-page">
        <h1 className="add-heading">Add A Movie</h1>
        <div className="add-movie-container">
          <form
            className="add-movie-form"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="form-group">
              <label htmlFor="homepage">Homepage URL</label>
              <input
                type="url"
                name="homepage"
                id="homepage"
                value={formData.homepage}
                onChange={handleChange}
                placeholder="https://example.com"
                required
              />
              {errors.homepage && <p className="error-msg">{errors.homepage}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                type="text"
                name="tagline"
                id="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Enter movie tagline"
                required
              />
              {errors.tagline && <p className="error-msg">{errors.tagline}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter movie title"
                required
              />
              {errors.title && <p className="error-msg">{errors.title}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vote_average">Vote Average</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  name="vote_average"
                  id="vote_average"
                  value={formData.vote_average}
                  onChange={handleChange}
                  placeholder="0.0 - 10.0"
                  required
                />
                {errors.vote_average && (
                  <p className="error-msg">{errors.vote_average}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="runtime">Runtime (minutes)</label>
                <input
                  type="number"
                  min="1"
                  name="rutime" // ✅ backend schema match
                  id="runtime"
                  value={formData.rutime}
                  onChange={handleChange}
                  placeholder="120"
                  required
                />
                {errors.runtime && <p className="error-msg">{errors.runtime}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <input
                type="text"
                name="genre"
                id="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="e.g., Action, Comedy, Drama"
                required
              />
              {errors.genre && <p className="error-msg">{errors.genre}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="poster">Poster Image</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  name="poster"
                  id="poster"
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={handleChange}
                  required
                />
                <span className="file-input-text">
                  {formData.poster ? formData.poster.name : "Choose poster image..."}
                </span>
              </div>
              {errors.poster && <p className="error-msg">{errors.poster}</p>}
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Adding Movie..." : "Add Movie"}
            </button>

            {message && (
              <div
                className={`message ${
                  message.includes("successfully") ? "success-msg" : "failure-msg"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
