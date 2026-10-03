import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNextNHRNumber,
  registerCandidate,
} from "../services/candidateService";

import "../styles/registration.css";

function RegistrationPage() {
  const navigate = useNavigate();

  const [nhrNo, setNhrNo] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    address: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loadingReference, setLoadingReference] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReferenceNumber();
  }, []);

  async function loadReferenceNumber() {
    try {
      setLoadingReference(true);
      setError("");

      const data = await getNextNHRNumber();
      setNhrNo(data.nhrNo);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingReference(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    let cleanedValue = value;

    // Name: letters, spaces, apostrophes, dots, and hyphens only.
    if (name === "name") {
      cleanedValue = value.replace(/[^A-Za-z\s.'-]/g, "");
    }

    // Position: letters, spaces, apostrophes, dots, and hyphens only.
    if (name === "position") {
      cleanedValue = value.replace(/[^A-Za-z\s.'-]/g, "");
    }

    // Address: allow letters, numbers, spaces, and symbols.
    // The value is not filtered here; validation only checks that it is not empty.

    // Email: allow letters and valid email symbols, but block numbers.
    if (name === "email") {
      cleanedValue = value.replace(/[^A-Za-z@._+-]/g, "");
    }

    // Mobile number: digits only, maximum 10 digits.
    if (name === "mobileNumber") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: cleanedValue,
    }));

    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    if (error) {
      setError("");
    }
  }

  function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    return age;
  }

  function validateForm() {
    const errors = {};

    const nameValue = formData.name.trim();
    const positionValue = formData.position.trim();
    const addressValue = formData.address.trim();
    const emailValue = formData.email.trim();
    const mobileValue = formData.mobileNumber.trim();

    const namePattern = /^[A-Za-z\s.'-]+$/;
    const positionPattern = /^[A-Za-z\s.'-]+$/;
    const emailPattern =
      /^[A-Za-z._%+-]+@[A-Za-z.-]+\.[A-Za-z]{2,}$/;
    const mobilePattern = /^\d{10}$/;

    if (!nameValue) {
      errors.name = "Candidate name is required.";
    } else if (!namePattern.test(nameValue)) {
      errors.name =
        "Name can contain only letters, spaces, apostrophes, dots, and hyphens.";
    }

    if (!positionValue) {
      errors.position = "Applied position is required.";
    } else if (!positionPattern.test(positionValue)) {
      errors.position =
        "Position can contain only letters, spaces, apostrophes, dots, and hyphens.";
    }

    if (!addressValue) {
      errors.address = "Address is required.";
    }

    if (!emailValue) {
      errors.email = "Email address is required.";
    } else if (!emailPattern.test(emailValue)) {
      errors.email =
        "Enter a valid email address without numbers.";
    }

    if (!mobileValue) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!mobilePattern.test(mobileValue)) {
      errors.mobileNumber =
        "Mobile number must contain exactly 10 digits.";
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();

      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        errors.dateOfBirth =
          "Date of birth cannot be a future date.";
      } else if (calculateAge(formData.dateOfBirth) < 18) {
        errors.dateOfBirth =
          "Candidate must be at least 18 years old.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      setError("Please correct the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const cleanedFormData = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        address: formData.address.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        dateOfBirth: formData.dateOfBirth,
      };

      const data = await registerCandidate(cleanedFormData);

      sessionStorage.setItem(
        "recruitId",
        String(data.candidate.RecruitID)
      );
      sessionStorage.setItem(
        "nhrNo",
        data.candidate.NHRNo
      );
      sessionStorage.setItem(
        "candidateName",
        data.candidate.Name
      );
      sessionStorage.setItem(
        "candidatePosition",
        data.candidate.Position
      );
     sessionStorage.setItem(
  "currentExamStage",
  "EQ_EXAM"
);

navigate("/eq/exam");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="registration-page">
      <section className="registration-card">
        <header className="registration-header">
          <img
            src="/images/GRI_logo.png"
            alt="GRI Logo"
            className="registration-logo"
          />

          <div>
            <h1>Global Rubber Industries</h1>
            <p>IQ and EQ Examination 2026</p>
          </div>
        </header>

        <div className="reference-box">
          <span>Reference No</span>

          <strong>
            {loadingReference ? "Loading..." : nhrNo}
          </strong>
        </div>

        {error && (
          <div
            className="registration-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          className="registration-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label htmlFor="name">
              Please Enter Your Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Your Full Name"
              maxLength={255}
              className={
                formErrors.name ? "input-error" : ""
              }
            />

            {formErrors.name && (
              <span className="field-error">
                {formErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="position">
              Applied Position
            </label>

            <input
              id="position"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleChange}
              placeholder="Enter Your Position"
              maxLength={255}
              className={
                formErrors.position
                  ? "input-error"
                  : ""
              }
            />

            {formErrors.position && (
              <span className="field-error">
                {formErrors.position}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Please Enter Your Address
            </label>

            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Example: No. 25/3, Main Road, Colombo 05"
              maxLength={255}
              className={
                formErrors.address ? "input-error" : ""
              }
            />

            {formErrors.address && (
              <span className="field-error">
                {formErrors.address}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Please Enter Your Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Your Email Address"
              maxLength={255}
              className={
                formErrors.email ? "input-error" : ""
              }
            />

            {formErrors.email && (
              <span className="field-error">
                {formErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">
              Please Enter Your Mobile Number
            </label>

            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              inputMode="numeric"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter Your Mobile Number"
              maxLength={10}
              className={
                formErrors.mobileNumber
                  ? "input-error"
                  : ""
              }
            />

            {formErrors.mobileNumber && (
              <span className="field-error">
                {formErrors.mobileNumber}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">
              Please Enter Your Date of Birth
            </label>

            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date()
                .toISOString()
                .split("T")[0]}
              className={
                formErrors.dateOfBirth
                  ? "input-error"
                  : ""
              }
            />

            {formErrors.dateOfBirth && (
              <span className="field-error">
                {formErrors.dateOfBirth}
              </span>
            )}
          </div>

          <div className="registration-actions">
            <button
              type="button"
              className="registration-back-button"
              onClick={() => navigate("/")}
              disabled={submitting}
            >
              Back
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingReference ||
                !nhrNo
              }
            >
              {submitting
                ? "Saving..."
                : "Continue to IQ Paper"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default RegistrationPage;