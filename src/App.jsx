import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient"; 

import Auth from "./components/Auth"; 
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomPage from "./pages/RoomPage";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const saved = localStorage.getItem("forum_user");
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      setUser(null);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (profile) {
            localStorage.setItem("forum_user", JSON.stringify(profile));
            setUser(profile);
          }
        } else {
          localStorage.removeItem("forum_user");
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("forum_user");
    setUser(null);
  };

  if (user === undefined) return null;

  return (
    /* Добавили basename, чтобы роутер корректно обрабатывал вложенные ссылки на GitHub Pages */
    <BrowserRouter basename="/MISLI">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/app" /> : <Auth setUser={setUser} />} />
        <Route path="/app" element={user ? <><Navbar user={user} /><Home user={user} /></> : <Navigate to="/auth" />} />
        <Route path="/rooms" element={user ? <><Navbar user={user} /><Rooms user={user} /></> : <Navigate to="/auth" />} />
        <Route path="/rooms/:id" element={user ? <><Navbar user={user} /><RoomPage user={user} /></> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <><Navbar user={user} /><Profile user={user} logout={logout} /></> : <Navigate to="/auth" />} />
        <Route path="/admin" element={user ? <><Navbar user={user} /><Admin user={user} /></> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
