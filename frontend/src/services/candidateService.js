import api from "./api";

export async function getNextNHRNumber() {
  const response = await api.get(
    "/candidates/next-nhr-number"
  );

  return response.data;
}

export async function registerCandidate(candidateData) {
  const response = await api.post(
    "/candidates/register",
    candidateData
  );

  return response.data;
}