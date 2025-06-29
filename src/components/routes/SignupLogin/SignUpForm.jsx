import { useState } from "react";
import "./SignUpForm.css";
import NavBar from "../Navbar/NavBar"

function SignUpForm() {
  const [err, setErr] = useState({});
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (ev) => {
    setFormData((oldFormData) => ({ ...oldFormData, [ev.target.name]: ev.target.value }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errors = validate();
    
    if (!Object.keys(errors).length) {
      try {
        const response = await fetch("https://uwatchfree-4.onrender.com/api/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("User registered successfully:", result);
          
          // Reset form on successful registration
          setFormData({ username: "", email: "", password: "" });
          setErr({});
          
          // Show success message
          setSuccessMessage("User registered successfully! You can now login.");
          
          // Optional: Clear success message after some time
          setTimeout(() => {
            setSuccessMessage("");
          }, 5000);
          
        } else {
          const errorData = await response.json();
          console.error("Registration failed:", errorData);
          
          // Clear success message if there's an error
          setSuccessMessage("");
          
          // Handle server errors
          if (errorData.message) {
            setErr({ server: errorData.message });
          } else {
            setErr({ server: "Registration failed. Please try again." });
          }
        }
      } catch (error) {
        console.error("Network error:", error);
        setSuccessMessage("");
        setErr({ server: "Network error. Please check your connection and try again." });
      }
    } else {
      setErr(errors);
      setSuccessMessage("");
    }
  };

  const validate = () => {
    const errors = {};
    if (formData.username.length <= 0) {
      errors.username = "Username Required";
    }

    if (
      formData.email.length <= 0 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errors.email = "Invalid email address";
    }

    if (formData.password.length <= 0) {
      errors.password1 = "Please enter a password";
    }

    if (!formData.password.split("").some((char) => char >= "A" && char <= "Z")) {
      errors.password2 = "*At least one capital letter req";
    }

    const regex = /[^a-zA-Z0-9]/;
    if (!regex.test(formData.password)) {
      errors.password3 = "*At least one special character req";
    }


    return errors;
  };

  return (
    <div className="signup-page">
      <NavBar />
      <div className="signup-container">
        <div className="signup-box">
          <fieldset className="signup-fieldset">
            <h2 className="signup-title">Sign Up</h2>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="signup-input"
                />
                {err.username && <div className="error-message">{err.username}</div>}
              </div>
              
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="signup-input"
                />
                {err.email && <div className="error-message">{err.email}</div>}
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="signup-input"
                />
                <div className="password-errors">
                  {Object.values(err).map(
                    (error, index) =>
                      error.startsWith("*") && (
                        <div key={index} className="password-requirement">
                          {error}
                        </div>
                      )
                  )}
                </div>
              </div>
              
              {err.server && (
                <div className="error-message" style={{ textAlign: 'center', marginTop: '1rem' }}>
                  {err.server}
                </div>
              )}
              
              {successMessage && (
                <div className="success-message" style={{ 
                  textAlign: 'center', 
                  marginTop: '1rem', 
                  color: '#4CAF50', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #4CAF50'
                }}>
                  {successMessage}
                </div>
              )}
              
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'white' }}>
                Already have an account? <a href="/login" style={{ color: '#ff8800', textDecoration: 'none' }}>Login here</a>
              </div>
              
              <button type="submit" className="signup-button">
                Sign Up
              </button>
            </form>
          </fieldset>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;