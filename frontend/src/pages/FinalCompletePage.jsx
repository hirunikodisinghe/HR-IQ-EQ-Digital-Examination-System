import { Navigate, useNavigate } from "react-router-dom";
import "../styles/eq.css";

function FinalCompletePage() {
  const navigate = useNavigate();
  const nhrNo = sessionStorage.getItem("nhrNo");
  const candidateName = sessionStorage.getItem("candidateName");

  if (!nhrNo) {
    return <Navigate to="/" replace />;
  }

  function finish() {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <main className="eq-complete-page">
      <section className="eq-complete-card">
        <div className="eq-complete-icon">✓</div>
        <h1>IQ &amp; EQ Examination Completed</h1>
        <p><strong>Candidate:</strong> {candidateName}</p>
        <p><strong>Reference No:</strong> {nhrNo}</p>
        <p>Thank you for completing the examination. Please inform the HR department.</p>
        <button type="button" onClick={finish}>Finish</button>
      </section>
    </main>
  );
}

export default FinalCompletePage;
