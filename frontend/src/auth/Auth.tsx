import { initializeApp } from "firebase/app";
import { getAuth, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import type { User } from "firebase/auth";
import { useState, useEffect } from "react";
import styled from "styled-components";

// Your web app's Firebase configuration (values are provided via Vite env vars)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthButton = styled.button`
  background: #111827;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #1f2937;
  }
`;

const UserInfo = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
`;

export function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed";
      setError(errorMessage);
      console.error("Google sign-in error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContainer>
      {user ? (
        <>
          <UserInfo>{user.email}</UserInfo>
          <AuthButton onClick={handleLogout}>Logout</AuthButton>
        </>
      ) : (
        <>
          <AuthButton onClick={handleGoogleSignIn}>
            Sign in with Google
          </AuthButton>
          {error && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>}
        </>
      )}
    </AuthContainer>
  );
}