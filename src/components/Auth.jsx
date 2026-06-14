import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Выходим на уровень выше в src

export default function Auth({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isValid = password.length >= 6 && (isSignUp ? username.trim().length > 0 : true);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ username })
            .eq("id", data.user.id);

          if (profileError) throw profileError;

          const { data: fullProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          localStorage.setItem("forum_user", JSON.stringify(fullProfile));
          setUser(fullProfile);
          navigate("/app");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileError) throw profileError;

          localStorage.setItem("forum_user", JSON.stringify(profileData));
          setUser(profileData);
          navigate("/app");
        }
      }
    } catch (error) {
      setErrorMsg(error.message || "Произошла ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleAuth}
        className="bg-white text-black p-8 rounded-3xl w-96 border border-neutral-200 shadow-xl flex flex-col"
      >
        <h1 className="text-3xl font-black mb-6 tracking-tight">
          {isSignUp ? "Регистрация" : "Вход"}
        </h1>

        {errorMsg && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
            {errorMsg}
          </p>
        )}

        {isSignUp && (
          <input
            required
            className="w-full border border-neutral-200 p-3 mb-3 rounded-xl outline-none focus:border-neutral-400 bg-neutral-50 text-base"
            placeholder="Никнейм (username)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          required
          type="email"
          className="w-full border border-neutral-200 p-3 mb-3 rounded-xl outline-none focus:border-neutral-400 bg-neutral-50 text-base"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          required
          type="password"
          className="w-full border border-neutral-200 p-3 mb-4 rounded-xl outline-none focus:border-neutral-400 bg-neutral-50 text-base"
          placeholder={isSignUp ? "Пароль (минимум 6 симв.)" : "Пароль"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={!isValid || loading}
          className="w-full bg-black text-white py-3.5 rounded-xl disabled:opacity-50 transition hover:bg-neutral-800 cursor-pointer font-bold text-sm tracking-wide shadow-md"
        >
          {loading ? "Загрузка..." : isSignUp ? "Создать аккаунт" : "Войти"}
        </button>

        <p className="text-center text-sm text-neutral-500 mt-5 font-medium">
          {isSignUp ? "Уже есть аккаунт?" : "Впервые на сайте?"}{" "}
          <span
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className="text-black font-bold underline cursor-pointer hover:text-neutral-700 ml-1"
          >
            {isSignUp ? "Войти" : "Зарегистрироваться"}
          </span>
        </p>
      </form>
    </div>
  );
}
