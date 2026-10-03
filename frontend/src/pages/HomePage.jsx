import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/home.css";

function HomePage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
  event.preventDefault();
  setError("");

  const enteredUserId = userId.trim().toUpperCase();

  if (!enteredUserId) {
    setError("Please enter your User ID.");
    return;
  }

  if (enteredUserId !== "NEWRECRUIT") {
    setError("Invalid User ID.");
    return;
  }

  sessionStorage.setItem(
    "examUserId",
    "NEWRECRUIT"
  );

  navigate("/registration");
}
  return (
    <main className="exam-home-page">
      <header className="exam-home-header">
        <div className="exam-home-brand">
          <img
            src="/images/GRI_logo.png"
            alt="GRI Logo"
            className="exam-home-logo"
          />

          <div>
            <h1>Global Rubber Industries</h1>
            <p>IQ and EQ Examination Portal</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="exam-home-error" role="alert">
          {error}
        </div>
      )}

      <section className="exam-home-content">
        <div className="exam-home-introduction">
          <span className="exam-home-badge">
            GRI IQ &amp; EQ Examination {new Date().getFullYear()}
          </span>

          <h2>
            GRI | Online IQ and EQ Assessment for New Candidates
          </h2>

          <p>
            Enter your User ID to begin the candidate registration process.
            After registration, the EQ paper will start first, followed by the
            IQ paper.
          </p>

          <div className="exam-flow">
            <div className="exam-flow-item">
              <span>01</span>
              <strong>Login with User ID</strong>
            </div>

            <div className="exam-flow-item">
              <span>02</span>
              <strong>Complete Candidate Registration</strong>
            </div>

            <div className="exam-flow-item">
              <span>03</span>
              <strong>Complete EQ Paper</strong>
            </div>

            <div className="exam-flow-item">
              <span>04</span>
              <strong>Complete IQ Paper</strong>
            </div>
          </div>
        </div>

        <aside className="exam-information-card">


          <h3>IQ &amp; EQ Paper</h3>

          <p>
            Please enter the User ID provided by HR to begin the examination.
          </p>

          <form
            className="paper-login-form"
            onSubmit={handleLogin}
          >
            <label htmlFor="userId">
              User ID
            </label>

            <input
  id="userId"
  type="text"
  value={userId}
  onChange={(event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "");

    setUserId(value);
  }}
  placeholder="Enter User ID"
  autoComplete="off"
  maxLength={20}
/>

            <button type="submit">
              Login
            </button>
          </form>

          <ul className="exam-information-list">
            <li>IQ paper will be completed first</li>
            <li>EQ paper will start after IQ submission</li>
            <li>Answers are saved securely</li>
            <li>The paper cannot be repeated after submission</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

export default HomePage;