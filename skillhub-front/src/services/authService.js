import api from "./axios";

const TOKEN_KEYS = ["access_token", "token", "auth_token"];

function pickString(value) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v || v === "undefined" || v === "null") return null;
  return v;
}

function extractBearerToken(authHeader) {
  const header = pickString(authHeader);
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return pickString(match?.[1] ?? header);
}

function extractToken(data) {
  if (!data || typeof data !== "object") return null;

  for (const key of TOKEN_KEYS) {
    const direct = pickString(data[key]);
    if (direct) return direct;
  }

  const nestedCandidates = [
    data?.data,
    data?.result,
    data?.authorization,
    data?.authorisation,
    data?.meta,
  ];

  for (const node of nestedCandidates) {
    if (!node || typeof node !== "object") continue;
    for (const key of TOKEN_KEYS) {
      const nested = pickString(node[key]);
      if (nested) return nested;
    }
  }

  const altKeys = ["accessToken", "jwt", "plainTextToken"];
  for (const key of altKeys) {
    const alt = pickString(data[key]);
    if (alt) return alt;
    const nestedAlt = pickString(data?.data?.[key]);
    if (nestedAlt) return nestedAlt;
  }

  return null;
}

function extractUser(data, fallbackUser) {
  if (data?.user && typeof data.user === "object") return data.user;
  if (data?.data?.user && typeof data.data.user === "object")
    return data.data.user;
  return fallbackUser ?? null;
}

function storeSession(data, fallbackUser) {
  const token = extractToken(data);
  const user = extractUser(data, fallbackUser);

  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }

  // On ne conserve l'utilisateur que si un token valide existe.
  // Sinon l'UI peut croire a une connexion alors que l'API refuse toutes les routes protegees.
  if (token && user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }

  return { token, user };
}

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const login = async (email, password) => {
  const response = await api.post("/login", { email, password });
  const headerToken =
    extractBearerToken(response.headers?.authorization) ||
    extractBearerToken(response.headers?.Authorization);

  const payload = headerToken
    ? { ...(response.data || {}), token: response.data?.token ?? headerToken }
    : response.data;

  const { token, user } = storeSession(payload);
  if (!token) {
    clearSession();
    throw new Error(
      "Connexion reussie mais token manquant dans la reponse serveur.",
    );
  }
  return user;
};

export const register = async ({ nom, prenom, email, password, role }) => {
  const { data } = await api.post("/register", {
    nom,
    prenom,
    email,
    password,
    role,
  });

  return data?.user ?? null;
};

export const logout = async () => {
  await api.post("/logout");
  clearSession();
};
