import { useContext } from "react";
import {
  AuthContext,
  AuthContextValue,
} from "../context/auth-context/auth-context";

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context as AuthContextValue;
};
