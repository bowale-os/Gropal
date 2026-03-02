const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

export const api = {
  onboard: (data: unknown) =>
    req("/onboarding", { method: "POST", body: JSON.stringify(data) }),

  getUser: (userId: string) => req(`/user/${userId}`),

  getGoals: (userId: string) => req(`/goals/${userId}`),

  recalculateGoals: (userId: string) =>
    req(`/goals/${userId}/recalculate`, { method: "POST" }),

  createGoal: (userId: string, data: unknown) =>
    req(`/goals/${userId}`, { method: "POST", body: JSON.stringify(data) }),

  tapCheck: (data: unknown) =>
    req("/tap-check", { method: "POST", body: JSON.stringify(data) }),

  tapCheckResolve: (data: unknown) =>
    req("/tap-check/resolve", { method: "POST", body: JSON.stringify(data) }),

  getAlternatives: (data: unknown) =>
    req("/alternatives", { method: "POST", body: JSON.stringify(data) }),

  selectAlternative: (data: unknown) =>
    req("/alternatives/select", { method: "POST", body: JSON.stringify(data) }),

  ask: (userId: string, message: string, history: unknown[]) =>
    req("/ask", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, message, conversation_history: history }),
    }),

  getHabits: (userId: string) => req(`/habits/${userId}`),

  completeHabit: (userId: string, habitId: string) =>
    req(`/habits/${userId}/${habitId}/complete`, { method: "POST" }),

  getSquad: (squadId: string) => req(`/squad/${squadId}`),

  getProgression: (userId: string) => req(`/progression/${userId}`),

  getRisks: (userId: string) => req(`/risks/${userId}`),

  getLimits: (userId: string) => req(`/limits/${userId}`),

  createLimit: (userId: string, data: unknown) =>
    req(`/limits/${userId}`, { method: "POST", body: JSON.stringify(data) }),
};
