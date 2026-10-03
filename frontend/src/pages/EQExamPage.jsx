import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  startEQExam,
  submitEQExam,
} from "../services/eqService";

import "../styles/eq.css";

const eqQuestions = [
  {
    id: 1,
    category: "Teamwork & Workplace Culture",
    question:
      "A new team member is struggling to fit in. What do you do?",
    options: {
      a: "Introduce them to the team and offer support.",
      b: "Let them figure it out on their own.",
      c: "Ignore them since it is not your responsibility.",
      d: "Focus on your own tasks and avoid interaction.",
    },
  },
  {
    id: 2,
    category: "Teamwork & Workplace Culture",
    question:
      "How do you react when a team member disagrees with your idea in a meeting?",
    options: {
      a: "Defend your idea strongly without considering their input.",
      b: "Listen to their viewpoint and have a constructive discussion.",
      c: "Get frustrated and disengage from the discussion.",
      d: "Take it personally and hold a grudge.",
    },
  },
  {
    id: 3,
    category: "Teamwork & Workplace Culture",
    question:
      "Your manager assigns you to collaborate with a difficult coworker. What is your approach?",
    options: {
      a: "Let conflicts get in the way of the project.",
      b: "Avoid working with them as much as possible.",
      c: "Complain to the manager about the situation.",
      d: "Try to find common ground and work professionally.",
    },
  },
  {
    id: 4,
    category: "Teamwork & Workplace Culture",
    question:
      "A team project is behind schedule, and stress is building. How do you handle it?",
    options: {
      a: "Blame others for the delay.",
      b: "Stay calm and work with the team to find a solution.",
      c: "Withdraw from the project to avoid stress.",
      d: "Get frustrated and argue with teammates.",
    },
  },
  {
    id: 5,
    category: "Teamwork & Workplace Culture",
    question:
      "How do you help maintain a positive workplace culture?",
    options: {
      a: "Complain about problems but do not contribute solutions.",
      b: "Ignore conflicts and let others handle them.",
      c: "Avoid engaging with colleagues beyond work tasks.",
      d: "Encourage open communication and teamwork.",
    },
  },
  {
    id: 6,
    category:
      "Handling Pressure & Personal Development",
    question:
      "You are under extreme pressure to meet a deadline. How do you handle it?",
    options: {
      a: "Complain about the workload but not take action.",
      b: "Panic and struggle to concentrate.",
      c: "Stay focused, prioritize tasks, and work efficiently.",
      d: "Procrastinate and hope for an extension.",
    },
  },
  {
    id: 7,
    category:
      "Handling Pressure & Personal Development",
    question:
      "You receive unexpected negative feedback from your manager. How do you respond?",
    options: {
      a: "Get defensive and argue against the feedback.",
      b: "Ask for clarification and use it to improve.",
      c: "Take it personally and lose motivation.",
      d: "Ignore it and continue as usual.",
    },
  },
  {
    id: 8,
    category:
      "Handling Pressure & Personal Development",
    question:
      "You made a mistake on an important project. What do you do?",
    options: {
      a: "Blame a colleague or external factors.",
      b: "Try to hide the mistake.",
      c: "Admit it, find a solution, and learn from it.",
      d: "Get overwhelmed and give up.",
    },
  },
  {
    id: 9,
    category:
      "Handling Pressure & Personal Development",
    question:
      "A stressful situation at work is affecting your mental well-being. What is your next step?",
    options: {
      a: "React emotionally and let it impact decisions.",
      b: "Let it affect your work and relationships.",
      c: "Bottle up emotions and avoid discussing them.",
      d: "Use stress management techniques and seek support if needed.",
    },
  },
  {
    id: 10,
    category:
      "Handling Pressure & Personal Development",
    question:
      "What do you do to continue growing personally and professionally?",
    options: {
      a: "Wait for someone else to push me forward.",
      b: "Stick to what I already know and avoid challenges.",
      c: "Seek feedback, set goals, and continuously learn.",
      d: "Focus only on my tasks without self-improvement.",
    },
  },
];

function EQExamPage() {
  const navigate = useNavigate();
  const examStartedRef = useRef(false);
  const autoNextTimerRef = useRef(null);

  const recruitId =
    sessionStorage.getItem("recruitId");

  const nhrNo =
    sessionStorage.getItem("nhrNo");

  const candidateName =
    sessionStorage.getItem("candidateName");

  const answerStorageKey = recruitId
    ? `eqAnswers_${recruitId}`
    : "eqAnswers";

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] = useState(() => {
    try {
      const savedAnswers =
        sessionStorage.getItem(answerStorageKey);

      return savedAnswers
        ? JSON.parse(savedAnswers)
        : {};
    } catch {
      return {};
    }
  });

  const [starting, setStarting] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function beginExam() {
      if (
        examStartedRef.current ||
        !recruitId
      ) {
        return;
      }

      examStartedRef.current = true;

      try {
        setStarting(true);
        setError("");

        await startEQExam(
          Number(recruitId)
        );

        sessionStorage.setItem(
          "currentExamStage",
          "EQ_EXAM"
        );
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setStarting(false);
      }
    }

    beginExam();

    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, [recruitId]);

  useEffect(() => {
    sessionStorage.setItem(
      answerStorageKey,
      JSON.stringify(answers)
    );
  }, [answers, answerStorageKey]);

  const answeredCount = useMemo(
    () =>
      eqQuestions.filter(
        (question) =>
          ["a", "b", "c", "d"].includes(
            answers[`HQ${question.id}`]
          )
      ).length,
    [answers]
  );

  if (!recruitId || !nhrNo) {
    return <Navigate to="/" replace />;
  }

  const currentQuestion =
    eqQuestions[currentIndex];

  const answerKey =
    `HQ${currentQuestion.id}`;

  const selectedAnswer =
    answers[answerKey] || "";

  const isLastQuestion =
    currentIndex ===
    eqQuestions.length - 1;

  const progress =
    (answeredCount / eqQuestions.length) * 100;

  function selectAnswer(option) {
    if (!["a", "b", "c", "d"].includes(option)) {
      return;
    }

    const updatedAnswers = {
      ...answers,
      [answerKey]: option,
    };

    setAnswers(updatedAnswers);
    setError("");

    sessionStorage.setItem(
      answerStorageKey,
      JSON.stringify(updatedAnswers)
    );

    if (!isLastQuestion) {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }

      autoNextTimerRef.current = setTimeout(() => {
        setCurrentIndex((previousIndex) =>
          Math.min(
            previousIndex + 1,
            eqQuestions.length - 1
          )
        );
      }, 400);
    }
  }

  function goPrevious() {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
    }

    setError("");

    setCurrentIndex((previousIndex) =>
      Math.max(previousIndex - 1, 0)
    );
  }

  function goToQuestion(index) {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
    }

    setCurrentIndex(index);
    setError("");
  }

  async function handleSubmit() {
    const finalAnswers = {};

    for (
      let index = 1;
      index <= eqQuestions.length;
      index += 1
    ) {
      const key = `HQ${index}`;
      const value = String(
        answers[key] || ""
      ).toLowerCase();

      if (!["a", "b", "c", "d"].includes(value)) {
        setCurrentIndex(index - 1);
        setError(
          `Please answer question ${index} before submitting.`
        );
        return;
      }

      finalAnswers[key] = value;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit the EQ paper? You cannot change your answers after submission."
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await submitEQExam(
        Number(recruitId),
        finalAnswers
      );

      sessionStorage.removeItem(
        answerStorageKey
      );

      sessionStorage.setItem(
        "currentExamStage",
        "IQ_EXAM"
      );

      navigate("/iq/exam");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (starting) {
    return (
      <main className="eq-status-page">
        <div className="eq-status-card">
          {error
            ? error
            : "Starting EQ examination..."}
        </div>
      </main>
    );
  }

  return (
    <main className="eq-exam-page">
      <section className="eq-exam-shell">
        <header className="eq-exam-header">
          <div className="eq-brand">
            <img
              src="/images/GRI_logo.png"
              alt="GRI Logo"
            />

            <div>
              <h1>
                Emotional Intelligence Test
              </h1>

              <p>
                {candidateName} · {nhrNo}
              </p>
            </div>
          </div>

          <div className="eq-answer-count">
            {answeredCount} /{" "}
            {eqQuestions.length} answered
          </div>
        </header>

        <div className="eq-progress-track">
          <div
            className="eq-progress-value"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <article className="eq-question-card">
          <div className="eq-question-meta">
            <span className="eq-category">
              {currentQuestion.category}
            </span>

            <span>
              Question {currentIndex + 1} of{" "}
              {eqQuestions.length}
            </span>
          </div>

          <h2>
            {currentQuestion.question}
          </h2>

          <div className="eq-options">
            {Object.entries(
              currentQuestion.options
            ).map(([letter, text]) => (
              <label
                key={letter}
                className={`eq-option ${
                  selectedAnswer === letter
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name={answerKey}
                  value={letter}
                  checked={
                    selectedAnswer === letter
                  }
                  onChange={() =>
                    selectAnswer(letter)
                  }
                />

                <span className="eq-option-letter">
                  {letter.toUpperCase()}
                </span>

                <span className="eq-option-text">
                  {text}
                </span>
              </label>
            ))}
          </div>

          {error && (
            <div
              className="eq-error"
              role="alert"
            >
              {error}
            </div>
          )}
        </article>

        <footer className="eq-navigation">
          <button
            type="button"
            className="eq-secondary-button"
            onClick={goPrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </button>

          <div className="eq-question-dots">
            {eqQuestions.map(
              (question, index) => {
                const key =
                  `HQ${question.id}`;

                return (
                  <button
                    key={question.id}
                    type="button"
                    className={[
                      "eq-question-dot",
                      index === currentIndex
                        ? "active"
                        : "",
                      answers[key]
                        ? "answered"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      goToQuestion(index)
                    }
                    aria-label={`Go to question ${
                      index + 1
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              }
            )}
          </div>

          {isLastQuestion ? (
            <button
              type="button"
              className="eq-submit-button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                answeredCount !==
                  eqQuestions.length
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit EQ Paper"}
            </button>
          ) : (
            <button
              type="button"
              className="eq-primary-button"
              onClick={() =>
                goToQuestion(currentIndex + 1)
              }
            >
              Next
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

export default EQExamPage;