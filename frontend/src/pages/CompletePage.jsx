import { useNavigate } from "react-router-dom";

function CompletePage() {
  const navigate = useNavigate();

  const candidateName =
    sessionStorage.getItem("candidateName");

  const nhrNo =
    sessionStorage.getItem("nhrNo");

  function handleFinish() {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        background: "#f3f6fb",
      }}
    >
      <section
        style={{
          width: "min(100%, 620px)",
          padding: "36px",
          textAlign: "center",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow:
            "0 18px 45px rgba(22, 39, 72, 0.12)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px",
            color: "#ffffff",
            background: "#168653",
            borderRadius: "50%",
            fontSize: "34px",
            fontWeight: "700",
          }}
        >
          ✓
        </div>

        <h1
          style={{
            marginBottom: "14px",
            color: "#111c35",
          }}
        >
          Examination Completed
        </h1>

        <p>
          <strong>Candidate:</strong>{" "}
          {candidateName || "-"}
        </p>

        <p>
          <strong>Reference Number:</strong>{" "}
          {nhrNo || "-"}
        </p>

        <p
          style={{
            marginTop: "20px",
            color: "#526176",
            lineHeight: "1.6",
          }}
        >
          Thank you for completing the IQ and EQ
          examination. Your answers have been saved
          successfully.
        </p>

        <button
          type="button"
          onClick={handleFinish}
          style={{
            marginTop: "24px",
            minWidth: "180px",
            padding: "12px 20px",
            color: "#ffffff",
            background: "#2f67ed",
            border: "none",
            borderRadius: "10px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Finish
        </button>
      </section>
    </main>
  );
}

export default CompletePage;