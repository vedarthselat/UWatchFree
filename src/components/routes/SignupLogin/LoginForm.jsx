import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Authenticator/Authenticator";
import "./LoginForm.css";
import NavBar from "../Navbar/NavBar";

const BASE_URL = "https://uwatchfree-4.onrender.com/api/users/login";

function LoginForm() {
  const [err, setErr] = useState({});
  const [formData, setFormData] = useState({ email: "", password: "" });
  const useAuth = useContext(AuthContext);
  const login = useAuth.login;
  const navigate = useNavigate();

  const handleChange = (ev) => {
    setFormData((oldFormData) => ({
      ...oldFormData,
      [ev.target.name]: ev.target.value,
    }));
  };

  async function getAPIKey(credentials) {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data["token"]) {
        login(data["token"]);
        navigate("/");
      } else {
        // Handle API errors
        if (data.errors && Array.isArray(data.errors)) {
          // Handle validation errors array format
          const formErrors = {};
          data.errors.forEach(error => {
            formErrors[error.path] = error.msg;
          });
          setErr(formErrors);
        } else if (data.error) {
          // Handle single error message (like "Invalid credentials")
          setErr({ global: data.error });
        } else if (data.message) {
          // Handle alternative single error message format
          setErr({ global: data.message });
        } else {
          // Handle unexpected error format
          setErr({ global: "An unexpected error occurred. Please try again." });
        }
      }
    } catch (error) {
      console.error("Error connecting to the API:", error);
      setErr({ global: "An unexpected error occurred. Please try again later." });
    }
  }

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const errors = validate();

    if (!Object.keys(errors).length) {
      // Send as JSON object instead of FormData
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      getAPIKey(credentials);

      // Don't clear form data and errors here - let the API response handle it
      // Only clear on successful login
    } else {
      setErr(errors);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  return (
    <>
    <NavBar />
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">Login</h1>
          <fieldset className="login-fieldset">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="login-input"
                />
                {err.email && <div className="error-message">{err.email}</div>}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input"
                />
                {err.password && <div className="error-message">{err.password}</div>}
              </div>

              {err.global && <div className="error-message global-error">{err.global}</div>}

              <div className="signup-link">
                <Link to="/SignUp">Don't have an account? Signup!</Link>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>
            </form>
          </fieldset>
        </div>
      </div>
    </div>
    </>
  );
}

export default LoginForm;