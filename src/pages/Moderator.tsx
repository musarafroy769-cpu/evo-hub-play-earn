import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Moderator() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      if (role !== "moderator" && role !== "admin") {
        navigate("/"); // Redirect if not allowed
      } else {
        setLoading(false);
      }
    };

    checkRole();
  }, [navigate]);

  if (loading) return <p>Checking permissions...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Moderator Panel</h1>
      <p>Welcome Moderator! Manage tournaments and user reports here.</p>
    </div>
  );
}
