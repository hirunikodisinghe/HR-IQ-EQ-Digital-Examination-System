import api from "./api";

export async function startIQExam(recruitId) {
  const response = await api.post("/iq/start", {
    recruitId,
  });

  return response.data;
}

export async function submitIQExam(
  recruitId,
  answers
) {
  const response = await api.post("/iq/submit", {
    recruitId,
    answers,
  });

  return response.data;
}