
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Excali-Lite
        </h1>
        <p className="text-xl text-muted-foreground">
          A simple, secure drawing app with Excalidraw
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground pt-8">
          Securely create and manage your Excalidraw drawings with auto-save
        </p>
      </div>
    </div>
  );
};

export default Index;
