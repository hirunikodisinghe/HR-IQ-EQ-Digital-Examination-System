import api from "./api";

export async function startEQExam(recruitId) {
  const response = await api.post("/eq/start", {
    recruitId,
  });

  return response.data;
}

export async function submitEQExam(recruitId, answers) {
  const response = await api.post("/eq/submit", {
    recruitId,
    answers,
  });

  return response.data;
}
