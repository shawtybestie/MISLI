import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Home({ user }) {
  // 1. Инициализируем состояния. Кэш позволяет мгновенно показать интерфейс
  const [posts, setPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_global_posts")) || [];
    } catch {
      return [];
    }
  });
  
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [thought, setThought] = useState(() => {
    return localStorage.getItem("cached_daily_thought") || "«Чем тише пространство — тем громче мысль.»";
  });

  // 2. Оптимизированная функция загрузки данных без риска зацикливания
  const fetchData = async () => {
    // Включаем лоадер только если локальный кэш полностью пуст
    if (posts.length === 0) {
      setLoading(true);
    }
    
    try {
      // Запрашиваем посты из облачной таблицы
      const { data: postsData, error: postsError } = await supabase
        .from("global_posts")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (!postsError && postsData) {
        setPosts(postsData);
        localStorage.setItem("cached_global_posts", JSON.stringify(postsData));
      }

      // Безопасный запрос мысли дня без падения в ошибку
      const { data: thoughtData, error: thoughtError } = await supabase
        .from("daily_thought")
        .select("text")
        .eq("id", 1);

      if (!thoughtError && thoughtData && thoughtData.length > 0) {
        setThought(thoughtData[0].text); // Исправлено извлечение строки из массива ответов PostgreSQL
        localStorage.setItem("cached_daily_thought", thoughtData[0].text);
      }
    } catch (err) {
      console.error("Сетевой сбой. Используются автономные данные кэша:", err);
    } finally {
      setLoading(false);
    }
  };

  // Исполняем строго один раз при монтировании экрана. Массив зависимостей пустой!
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Функция публикации новой записи
  const createPost = async () => {
    if (!content.trim()) return;

    const textToSend = content.trim();
    setContent(""); // Мгновенно очищаем поле ввода, чтобы предотвратить повторные клики

    // Создаем оптимистичный локальный объект для мгновенного вывода на экран смартфона/ПК
    const newLocalPost = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      username: user?.username || "Пользователь",
      content: textToSend,
      created_at: new Date().toISOString()
    };

    const updated = [newLocalPost, ...posts];
    setPosts(updated);
    localStorage.setItem("cached_global_posts", JSON.stringify(updated));

    try {
      // Спокойно пишем в облачную базу данных в фоновом режиме
      await supabase.from("global_posts").insert([
        {
          user_id: user?.id,
          username: user?.username || "Пользователь",
          content: textToSend
        }
      ]);
    } catch (err) {
      console.error("Ошибка асинхронной записи поста в Supabase:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createPost();
    }
  };

  return (
    <div className="min-h-screen text-white px-8 py-10 overflow-x-hidden">
      <div className="w-full"> 
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ЛЕВАЯ ПАНЕЛЬ: ФОРМА СОЗДАНИЯ */}
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-6">
            <div className="bg-white text-black rounded-3xl p-5 border border-neutral-200 flex flex-col w-full shadow-sm">
              <h3 className="font-bold mb-3 text-lg tracking-tight">Новая мысль</h3>
              <div className="border border-neutral-200 rounded-2xl p-3 focus-within:border-neutral-400 transition bg-neutral-50">
                <textarea
                  placeholder="Поделитесь мыслью..."
                  className="w-full text-black min-h-[100px] resize-none outline-none text-base border-0 p-0 m-0 bg-transparent block"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex justify-start mt-4">
                <button 
                  onClick={createPost} 
                  className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer shadow-sm block w-full text-center"
                >
                  Опубликовать
                </button>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ ПАНЕЛЬ: ЦИТАТА И ХРОНОЛОГИЧЕСКАЯ ЛЕНТА */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            <div className="bg-white text-black rounded-3xl p-8 w-full border border-neutral-200 shadow-sm">
              <p className="uppercase tracking-widest text-xs text-neutral-400 font-semibold mb-2">
                Мысль дня
              </p>
              <h2 className="text-3xl font-bold leading-tight md:text-4xl text-black">
                {thought}
              </h2>
              <p className="mt-3 text-neutral-600 text-sm">
                Платформа для идей, наблюдения и свободного диалога.
              </p>
            </div>

            <div className="space-y-4 w-full">
              {loading && posts.length === 0 ? (
                <div className="text-neutral-400 text-center py-10 bg-neutral-900 border border-neutral-800 rounded-3xl">
                  Синхронизация с облачной базой данных...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-neutral-500 text-center py-10 bg-neutral-900/30 border border-neutral-900 border-dashed rounded-3xl">
                  Лента мыслей пуста. Напишите первое суждение!
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white text-black rounded-3xl p-6 border border-neutral-100 min-w-0 shadow-sm">
                    <div className="flex justify-between items-center mb-3 gap-4">
                      <h3 className="font-bold text-black truncate">@{post.username}</h3>
                      <span className="text-xs text-neutral-400 shrink-0">
                        {new Date(post.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-neutral-800 text-base whitespace-pre-wrap break-words min-w-0 [word-break:break-word] leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
