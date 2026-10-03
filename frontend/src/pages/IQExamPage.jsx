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
  startIQExam,
  submitIQExam,
} from "../services/iqService";

import "../styles/iq.css";

const iqQuestions = [
  {
    id: 1,
    question: "18, 15, 20, 17, 22, ?, ?",
    options: {
      a: "18 and 23",
      b: "19 and 24",
      c: "20 and 25",
      d: "18 and 24",
    },
  },
  {
    id: 2,
    question: "212, 179, 146, 113, ___ ?",
    options: {
      a: "92",
      b: "90",
      c: "80",
      d: "100",
    },
  },
  {
    id: 3,
    question: "Choose the missing pattern.",
    image: "/images/iq/question-03.png",
    options: {
      a: "1",
      b: "2",
      c: "3",
      d: "4",
      e: "5",
      f: "6",
    },
  },
  {
    id: 4,
    question: "The missing number is...",
    image: "/images/iq/question-04.png",
    options: {
      a: "3",
      b: "8",
      c: "9",
      d: "11",
    },
  },
  {
    id: 5,
    question: "Choose the missing pattern.",
    image: "/images/iq/question-05.png",
    options: {
      a: "1",
      b: "2",
      c: "3",
      d: "4",
      e: "5",
      f: "6",
    },
  },
  {
    id: 6,
    question: "The missing number is...",
    image: "/images/iq/question-06.png",
    options: {
      a: "2",
      b: "20",
      c: "24",
      d: "25",
    },
  },
  {
    id: 7,
    question:
      "Which animal does not belong in the group?",
    options: {
      a: "Kangaroo",
      b: "Koala",
      c: "Lion",
      d: "Possum",
    },
  },
  {
    id: 8,
    question:
      "Which of the cities does not fit in?",
    options: {
      a: "Manila",
      b: "Bogota",
      c: "Liverpool",
      d: "Tokyo",
      e: "Taipei",
    },
  },
  {
    id: 9,
    question:
      " Which of the means of transportation does not belong in the following group?",
    options: {
      a: "Bike",
      b: "Telega",
      c: "Sled",
      d: "Trolleybus",
      e: "Car",
    },
  },
  {
    id: 10,
    question:
      "It is a quarter to twelve. What will the clock show if the hour and minute hands are reversed?",
    options: {
      a: "6:15",
      b: "6:45",
      c: "3:45",
      d: "9:00",
    },
  },
  {
    id: 11,
    question:
      "How many times does the number 1 appear from one to one hundred?",
    options: {
      a: "21",
      b: "19",
      c: "17",
      d: "18",
    },
  },
  {
    id: 12,
    question:
      "The length of the fish’s head is 9 centimeters; the tail is the sum of the lengths of the head and half of the body, and the body is the sum of the lengths of the tail and head. What is the length of the fish in centimeters?",
    options: {
      a: "45",
      b: "36",
      c: "72",
      d: "27",
    },
  },
  {
    id: 13,
    question:
      "The hotel has 7 floors. 4 people live on the first floor, and on every other floor 2 more than on the previous floor. Which floor is the elevator called most often?",
    options: {
      a: "1",
      b: "3",
      c: "5",
      d: "7",
    },
  },
  {
    id: 14,
    question:
      "Yuri Gagarin was the first person to walk on the Moon.",
    options: {
      a: "True",
      b: "False",
    },
  },
  {
    id: 15,
    question: "The missing number is...",
    image: "/images/iq/question-15.png",
    options: {
      a: "6",
      b: "8",
      c: "10",
      d: "11",
    },
  },
  {
    id: 16,
    question: "The missing number is...",
    image: "/images/iq/question-16.png",
    options: {
      a: "3",
      b: "18",
      c: "27",
      d: "81",
    },
  },
  {
    id: 17,
    question:
      "B2CD, _____, BCD4, B5CD, BC6D",
    options: {
      a: "B2C2D",
      b: "BC3D",
      c: "B2C3D",
      d: "BCD7",
    },
  },
  {
    id: 18,
    question:
      " Sarah is currently 30 years old, and she is five times older than her sister. How old will Sarah be when she is three times her sister’s age?",
    options: {
      a: "35 years",
      b: "36 years",
      c: "40 years",
      d: "45 years",
    },
  },
  {
    id: 19,
    question:
      "A restaurant reduces the price of a meal by 25%. What percentage must the discounted price be increased to return to the original price?",
    options: {
      a: "20%",
      b: "25%",
      c: "33.33%",
      d: "50%",
    },
  },
  {
    id: 20,
    question:
      'Identify the mirror image of "QR78E".',
    options: {
      a: "E87PQ",
      b: "E87QP",
      c: "3ƨ87P",
      d: "Ǝ87ⱤQ",
    },
  },
];

function IQExamPage() {
  const navigate = useNavigate();
  const examStartedRef = useRef(false);
  const nextQuestionTimerRef = useRef(null);

  const recruitId =
    sessionStorage.getItem("recruitId");

  const nhrNo =
    sessionStorage.getItem("nhrNo");

  const candidateName =
    sessionStorage.getItem("candidateName");

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [starting, setStarting] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function beginIQExam() {
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

        await startIQExam(
          Number(recruitId)
        );

        sessionStorage.setItem(
          "currentExamStage",
          "IQ_EXAM"
        );
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setStarting(false);
      }
    }

    beginIQExam();

    return () => {
      if (nextQuestionTimerRef.current) {
        clearTimeout(
          nextQuestionTimerRef.current
        );
      }
    };
  }, [recruitId]);

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  if (!recruitId || !nhrNo) {
    return <Navigate to="/" replace />;
  }

  const currentQuestion =
    iqQuestions[currentIndex];

  const answerKey =
    `IQ${currentQuestion.id}`;

  const selectedAnswer =
    answers[answerKey] || "";

  const isLastQuestion =
    currentIndex === iqQuestions.length - 1;

  const progress =
    ((currentIndex + 1) /
      iqQuestions.length) *
    100;

  function selectAnswer(option) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [answerKey]: option,
    }));

    setError("");

    if (!isLastQuestion) {
      if (nextQuestionTimerRef.current) {
        clearTimeout(
          nextQuestionTimerRef.current
        );
      }

      nextQuestionTimerRef.current =
        setTimeout(() => {
          setCurrentIndex(
            (previousIndex) =>
              Math.min(
                previousIndex + 1,
                iqQuestions.length - 1
              )
          );
        }, 400);
    }
  }

  function goPrevious() {
    setError("");

    setCurrentIndex((previousIndex) =>
      Math.max(previousIndex - 1, 0)
    );
  }

  async function handleSubmit() {
    if (!selectedAnswer) {
      setError(
        "Please select an answer for this question."
      );
      return;
    }

    if (
      answeredCount !==
      iqQuestions.length
    ) {
      setError(
        "Please answer all 20 IQ questions."
      );
      return;
    }

    const confirmed = window.confirm(
      "Submit the IQ paper? You cannot change your answers after submission."
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await submitIQExam(
        Number(recruitId),
        answers
      );

      sessionStorage.setItem(
        "currentExamStage",
        "COMPLETED"
      );

      navigate("/completed");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (starting) {
    return (
      <main className="iq-status-page">
        <div className="iq-status-card">
          Starting IQ examination...
        </div>
      </main>
    );
  }

  return (
    <main className="iq-exam-page">
      <section className="iq-exam-shell">
        <header className="iq-exam-header">
          <div className="iq-brand">
            <img
              src="/images/GRI_logo.png"
              alt="GRI Logo"
            />

            <div>
              <h1>IQ Examination</h1>

              <p>
                {candidateName} · {nhrNo}
              </p>
            </div>
          </div>

          <div className="iq-answer-count">
            {answeredCount} /{" "}
            {iqQuestions.length} answered
          </div>
        </header>

        <div className="iq-progress-track">
          <div
            className="iq-progress-value"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <article className="iq-question-card">
          <div className="iq-question-meta">
            <span className="iq-question-label">
              IQ Assessment
            </span>

            <span>
              Question {currentIndex + 1} of{" "}
              {iqQuestions.length}
            </span>
          </div>

          <h2>
            {currentQuestion.question}
          </h2>

          {currentQuestion.image && (
            <div className="iq-question-image-wrapper">
              <img
                src={currentQuestion.image}
                alt={`Question ${currentQuestion.id} diagram`}
                className="iq-question-image"
              />
            </div>
          )}

          <div className="iq-options">
  {Object.entries(
    currentQuestion.options
  ).map(([letter, text], optionIndex) => {
    const optionNumber = optionIndex + 1;

    const storedAnswer =
      `${optionNumber}) ${text}`;

    return (
      <label
        key={letter}
        className={`iq-option ${
          selectedAnswer === storedAnswer
            ? "selected"
            : ""
        }`}
      >
        <input
          type="radio"
          name={answerKey}
          value={storedAnswer}
          checked={
            selectedAnswer === storedAnswer
          }
          onChange={() =>
            selectAnswer(storedAnswer)
          }
        />

        <span className="iq-option-letter">
          {optionNumber}
        </span>

        <span className="iq-option-text">
          {text}
        </span>
      </label>
    );
  })}
</div>

          {error && (
            <div
              className="iq-error"
              role="alert"
            >
              {error}
            </div>
          )}
        </article>

        <footer className="iq-navigation">
          <button
            type="button"
            className="iq-secondary-button"
            onClick={goPrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </button>

          <div className="iq-question-dots">
            {iqQuestions.map(
              (question, index) => {
                const key =
                  `IQ${question.id}`;

                return (
                  <button
                    key={question.id}
                    type="button"
                    className={[
                      "iq-question-dot",
                      index === currentIndex
                        ? "active"
                        : "",
                      answers[key]
                        ? "answered"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setCurrentIndex(index);
                      setError("");
                    }}
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
              className="iq-submit-button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit IQ Paper"}
            </button>
          ) : (
            <button
              type="button"
              className="iq-primary-button"
              onClick={() =>
                setCurrentIndex(
                  (previousIndex) =>
                    Math.min(
                      previousIndex + 1,
                      iqQuestions.length - 1
                    )
                )
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

export default IQExamPage;