import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Admin({ user }) {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);

  // Стейты для фразы дня
  const [currentThought, setCurrentThought] = useState("");
  const [newThought, setNewThought] = useState("");

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl font-bold bg-black">
        Доступ ограничен. Вы не являетесь администратором.
      </div>
    );
  }

  // READ: Загрузка постов и текущей фразы дня
  const fetchData = async () => {
    setLoading(true);
    
    // Тянем посты
    const { data: postsData } = await supabase
      .from("global_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (postsData) setPosts(postsData);

    // Тянем фразу дня
    const { data: thoughtData } = await supabase
      .from("daily_thought")
      .select("text")
      .eq("id", 1)
      .single();
    if (thoughtData) {
      setCurrentThought(thoughtData.text);
      setNewThought(thoughtData.text);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // UPDATE: Обновление фразы дня
  const handleUpdateThought = async (e) => {
    e.preventDefault();
    if (!newThought.trim()) return;

    const { error } = await supabase
      .from("daily_thought")
      .update({ text: newThought.trim(), updated_at: new Date() })
      .eq("id", 1);

    if (!error) {
      alert("Фраза дня успешно обновлена!");
      fetchData();
    } else {
      alert("Ошибка обновления: " + error.message);
    }
  };

  // Остальной CRUD для постов
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    const { error } = await supabase.from("global_posts").insert([
      { user_id: user.id, username: `${user.username} (Администратор)`, content: newContent.trim() },
    ]);
    if (!error) { setNewContent(""); fetchData(); }
  };

  const handleUpdate = async (id) => {
    if (!editingText.trim()) return;
    const { error } = await supabase.from("global_posts").update({ content: editingText }).eq("id", id);
    if (!error) { setEditingPostId(null); setEditingText(""); fetchData(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить этот пост?")) return;
    const { error } = await supabase.from("global_posts").delete().eq("id", id);
    if (!error) fetchData();
  };

  return (
    <div className="min-h-screen text-white px-8 py-10 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        <h1 className="text-4xl font-black tracking-tight bg-red-600 inline-block px-4 py-1.5 rounded-xl shadow-lg">
          Панель администратора (CRUD)
        </h1>

        {/* УПРАВЛЕНИЕ ФРАЗОЙ ДНЯ */}
        <div className="bg-white text-black p-6 rounded-3xl border border-neutral-200 shadow-xl">
          <h2 className="text-xl font-bold mb-1">Управление функцией «Фраза дня»</h2>
          <p className="text-sm text-neutral-500 mb-4">Текущая фраза: <span className="italic font-semibold text-neutral-800">"{currentThought}"</span></p>
          <form onSubmit={handleUpdateThought} className="flex gap-4">
            <input
              type="text"
              className="flex-1 border border-neutral-200 rounded-xl p-3 bg-neutral-50 outline-none focus:border-neutral-400 text-base"
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
            />
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition shadow-md">
              Обновить фразу
            </button>
          </form>
        </div>

        {/* CREATE BLOCK ПОСТОВ */}
        <div className="bg-white text-black p-6 rounded-3xl border border-neutral-200 shadow-xl">
          <h2 className="text-xl font-bold mb-3">Опубликовать глобальное объявление</h2>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input
              type="text"
              placeholder="Текст официального сообщения..."
              className="flex-1 border border-neutral-200 rounded-xl p-3 bg-neutral-50 outline-none focus:border-neutral-400 text-base"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <button className="bg-black hover:bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition shadow-md">
              Создать пост
            </button>
          </form>
        </div>

        {/* ТАБЛИЦА ПОСТОВ */}
        <div className="bg-white text-black rounded-3xl p-6 border border-neutral-200 shadow-xl overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Управление базой данных постов</h2>
          {loading ? (
            <p className="text-neutral-500 font-medium">Загрузка данных...</p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 text-sm font-semibold uppercase">
                  <th className="py-3 px-4">Автор</th>
                  <th className="py-3 px-4 w-1/2">Содержимое</th>
                  <th className="py-3 px-4">Дата</th>
                  <th className="py-3 px-4 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-50 transition">
                    <td className="py-4 px-4 font-bold text-sm">@{post.username}</td>
                    <td className="py-4 px-4 text-sm">
                      {editingPostId === post.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="border border-neutral-300 p-1.5 rounded-lg w-full outline-none text-black"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                          />
                          <button onClick={() => handleUpdate(post.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">Сохранить</button>
                          <button onClick={() => setEditingPostId(null)} className="bg-neutral-400 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">Отмена</button>
                        </div>
                      ) : ( <p className="break-all">{post.content}</p> )}
                    </td>
                    <td className="py-4 px-4 text-xs text-neutral-500">{new Date(post.created_at).toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setEditingPostId(post.id); setEditingText(post.content); }} className="bg-neutral-900 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer">Изменить</button>
                        <button onClick={() => handleDelete(post.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer">Удалить</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
