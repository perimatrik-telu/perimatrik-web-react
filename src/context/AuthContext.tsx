import { useState, useEffect, type ReactNode } from "react";
import { ApiError, fetchApi } from "../utils/api";
import type { User } from "../types/models";
import Cookies from "js-cookie";
import { AuthContext } from "./auth-context";

interface AuthUserResponse {
  data: User;
}

interface LoginResponse {
  data: {
    access_token: string;
    token_type: string;
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    Cookies.get("auth_token") || null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get cookie domain
  const getCookieDomain = () => {
    const hostname = window.location.hostname;

    // On localhost, don't set domain attribute.
    // Browsers often ignore .localhost or localhost as a domain for cookies.
    if (hostname.includes("localhost") || hostname === "127.0.0.1") {
      return undefined;
    }

    if (hostname.includes("perimatrik.org")) {
      return ".perimatrik.org"; // Share across all subdomains in production
    }
    return undefined;
  };

  useEffect(() => {
    if (token) {
      fetchApi("auth/current-user")
        .then((response) => {
          setUser((response as AuthUserResponse).data);
        })
        .catch((error) => {
          // Only drop the session when the server rejects the token. Aborted requests
          // (refresh / navigating away), network errors and 5xx must not log the user out.
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            Cookies.remove("auth_token", { domain: getCookieDomain() });
            setToken(null);
          }
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: object) => {
    setIsLoading(true);
    try {
      Cookies.remove("auth_token", { domain: getCookieDomain() });
      setToken(null);
      setUser(null);

      const response = await fetchApi<LoginResponse>("auth/login", {
        method: "POST",
        body: credentials,
      });

      const { access_token } = response.data;

      // Save to cookie with domain sharing
      Cookies.set("auth_token", access_token, {
        expires: 7, // 7 days
        domain: getCookieDomain(),
        path: "/",
      });

      setToken(access_token);

      const userResponse = await fetchApi<AuthUserResponse>("auth/current-user");
      setUser(userResponse.data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetchApi("auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
