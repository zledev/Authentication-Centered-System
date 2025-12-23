export interface JwtPayload {
  email: string;
  id: string;
  type: string;
  iat: number;
  exp: number;
}