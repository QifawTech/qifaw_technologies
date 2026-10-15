import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/client.js";
import Loader from "./Loader.jsx";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });

  useEffect(() => {
    let cancelled = false;
    api.get("/admin/me")
      .then((res) => {
        if (cancelled) return;
        const csrf = res.data?.data?.csrf_token;
        if (csrf) sessionStorage.setItem("csrf_token", csrf);
        setState({ loading: false, ok: true });
      })
      .catch(() => !cancelled && setState({ loading: false, ok: false }));
    return () => { cancelled = true; };
  }, []);

  if (state.loading) return <Loader />;
  if (!state.ok) return <Navigate to="/admin/login" replace />;
  return children;
}