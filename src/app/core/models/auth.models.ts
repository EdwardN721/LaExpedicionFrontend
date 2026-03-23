// src/app/core/models/auth.models.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  primerApellido: string;
  segundoApellido?: string | null;
  correo: string; // Fíjate que en tu DTO se llama Correo, no Email
  password: string;
  telefono: string;
}

export interface AuthResponse {
  token: string;
}

export interface TokenPayload {
  sub?: string;
  email?: string;
  unique_name?: string;
  role?: string;
  exp: number;
  [key: string]: any;
}