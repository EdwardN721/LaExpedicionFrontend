// ─── Models ─────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiration: string;
  role: string;
  userName: string;
  userId: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  unique_name: string;
  exp: number;
}
