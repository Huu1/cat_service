export interface JwtPayload {
  userId: number;
  username: string;
  roles: string[];
}