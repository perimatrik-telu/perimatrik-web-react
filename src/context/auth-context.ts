import { createContext } from "react";
import type { User } from "../types/models";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: object) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
