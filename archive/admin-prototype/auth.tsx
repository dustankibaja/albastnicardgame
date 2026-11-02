import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginAdmin } from "@/api/api";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginAdmin({ data: password });
      if (result.success) {
        navigate({ to: "/admin" });
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm rounded-xl border p-6 shadow-md bg-card">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-sm text-muted-foreground">Sign in as admin@albastinicardgame.com</p>
        
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Enter password"
          />
        </div>
        
        {error && <p className="text-sm text-destructive">{error}</p>}
        
        <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium">
          Sign In
        </button>
      </form>
    </div>
  );
}
