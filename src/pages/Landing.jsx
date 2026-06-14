import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen  text-white flex flex-col items-center justify-center px-6">

      <h1 className="text-6xl font-bold mb-6">
        Мысли.Онлайн
      </h1>

      <p className="text-neutral-400 text-center max-w-xl mb-10">
        Форум без лайков, рейтингов и алгоритмов.
        Только мысли и диалог между пользователями.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/auth")}
          className="bg-white text-black px-6 py-3 rounded-xl"
        >
          Войти
        </button>

        <button
          onClick={() => navigate("/app")}
          className="border border-white px-6 py-3 rounded-xl"
        >
          Войти в форум
        </button>
      </div>

    </div>
  );
}