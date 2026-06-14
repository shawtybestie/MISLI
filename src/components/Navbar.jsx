import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user }) {
  // Доступные темы: lofi, dark, light
  const [theme, setTheme] = useState(localStorage.getItem("site_theme") || "lofi");

  useEffect(() => {
    // Удаляем старые классы тем с тега body
    document.body.classList.remove("theme-lofi", "theme-dark", "theme-light");
    // Добавляем текущую тему
    document.body.classList.add(`theme-${theme}`);
    // Сохраняем выбор в память устройства
    localStorage.setItem("site_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "lofi") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("lofi");
  };

  return (
    <header className="bg-black border-b border-neutral-800 relative w-full select-none">
      {/* На мобильных (до md) делаем flex-col и убираем абсолютное позиционирование, на ПК возвращаем flex-row */}
      <div className="w-full px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">

        {/* Left: Ссылки */}
        <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6 order-2 md:order-1">
          <Link
            to={user ? "/app" : "/"}
            className="text-white text-sm md:text-lg hover:text-neutral-300 transition font-medium"
          >
            Мысль дня
          </Link>

          <Link
            to="/rooms"
            className="text-white hover:text-neutral-300 transition font-medium text-sm md:hidden"
          >
            Комнаты
          </Link>

          {user?.is_admin && (
            <Link
              to="/admin"
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition shadow-md whitespace-nowrap"
            >
              Панель управления (CRUD)
            </Link>
          )}
        </div>

        {/* Center: Логотип */}
        {/* На ПК позиционируем строго по центру, на мобильных — обычный блок сверху */}
        <div className="text-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2 order-1 md:order-2">
          <Link to="/">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide hover:text-neutral-300 transition cursor-pointer">
              Мысли.Онлайн
            </h1>
          </Link>
        </div>

        {/* Right: Профиль и Настройки */}
        <div className="flex items-center justify-center md:justify-end gap-3 md:gap-5 order-3">
          {/* Дипломный элемент: Кнопка переключения тем */}
          <button
            onClick={toggleTheme}
            className="border border-neutral-700 hover:border-neutral-500 text-white text-[11px] md:text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer bg-neutral-900 whitespace-nowrap"
            title="Сменить тему оформления"
          >
            {theme === "lofi" && "🎨 Lofi Фронт"}
            {theme === "dark" && "🌙 Ночь"}
            {theme === "light" && "☀️ День"}
          </button>

          {/* Ссылка "Авторские комнаты" видна на ПК, на мобильных прячется в левую панель */}
          <Link
            to="/rooms"
            className="hidden md:inline text-white hover:text-neutral-300 transition font-medium text-sm"
          >
            Авторские комнаты
          </Link>

          {user && (
            <Link
              to="/profile"
              className="bg-white text-black px-4 py-2 rounded-xl hover:bg-neutral-200 transition font-bold text-xs md:text-sm whitespace-nowrap truncate max-w-[120px] md:max-w-none"
            >
              @{user.username}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
