import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/login.css";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter your email address and password.");
      return;
    }

    if (
      formData.email === "admin@gri.com" &&
      formData.password === "1234"
    ) {
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("loginUser", formData.email);

      navigate("/home");
      return;
    }

    setError("Invalid email address or password.");
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <h1>HR IQ Dashboard</h1>
          <p>Sign in to review candidate IQ results</p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="login-field">
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
        </form>

        <p className="login-note">
          New user? Sign up
        </p>
      </section>
    </main>
  );
}

export default LoginPage;