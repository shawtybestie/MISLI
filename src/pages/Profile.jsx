import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Profile(props) {
  const user = props.user;
  
  const [myRoomsCount, setMyRoomsCount] = useState(0);
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const { data: rooms } = await supabase.from("rooms").select("id").eq("user_id", user.id);
        if (rooms) setMyRoomsCount(rooms.length);

        const { data: posts } = await supabase.from("global_posts").select("id").eq("user_id", user.id);
        if (posts) setMyPostsCount(posts.length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    const updateData = {};
    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setMessage({ text: "Пароль должен быть не менее 6 символов", isError: true });
        setLoading(false);
        return;
      }
      updateData.password = newPassword.trim();
    }
    if (newEmail.trim() && newEmail.trim() !== user?.email) {
      updateData.email = newEmail.trim();
    }

    if (Object.keys(updateData).length === 0) {
      setMessage({ text: "Введите новые данные для изменения", isError: true });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser(updateData);
      if (error) throw error;
      if (data?.user) {
        setMessage({ 
          text: updateData.email ? "Ссылка для подтверждения отправлена на новую почту!" : "Данные успешно обновлены!", 
          isError: false 
        });
        setNewPassword("");
      }
    } catch (error) {
      setMessage({ text: error.message || "Ошибка обновления", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleLocalLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    localStorage.clear();
    if (props.logout) {
      props.logout();
    } else {
      window.location.href = "/auth";
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] text-white px-8 py-10 overflow-x-hidden flex flex-col justify-between">
      <div className="w-full flex-1 flex flex-col justify-between space-y-8">
        
        <div className="bg-white text-black rounded-3xl p-8 border border-neutral-200 flex-1 flex flex-col justify-between">
          
          <div className="flex flex-col items-center text-center w-full">
            <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-4xl font-extrabold shadow-md mb-4 shrink-0 select-none">
              {user?.username ? user.username.toUpperCase() : "U"}
            </div>
            <div className="w-full max-w-2xl px-4 min-w-0">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black break-words [word-break:break-word] leading-tight">
                @{user?.username}
              </h1>
            </div>
          </div>

          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                <p className="text-4xl font-black text-black">{myPostsCount}</p>
                <p className="text-sm font-semibold text-neutral-400 mt-2 uppercase tracking-wider">
                  Сообщений отправлено
                </p>
              </div>
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                <p className="text-4xl font-black text-black">{myRoomsCount}</p>
                <p className="text-sm font-semibold text-neutral-400 mt-2 uppercase tracking-wider">
                  Мои комнаты
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto w-full bg-neutral-50 border border-neutral-100 p-6 rounded-2xl shadow-sm mb-6">
            <h2 className="text-lg font-bold mb-4 tracking-tight text-black">Безопасность и данные аккаунта</h2>
            
            {message.text && (
              <div className={`text-sm p-3 mb-4 rounded-xl font-medium border ${
                message.isError ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Электронная почта</label>
                <input
                  type="email"
                  className="w-full border border-neutral-200 p-3 rounded-xl outline-none focus:border-neutral-400 bg-white text-base text-black font-medium"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Новый пароль</label>
                <input
                  type="password"
                  className="w-full border border-neutral-200 p-3 rounded-xl outline-none focus:border-neutral-400 bg-white text-base text-black font-medium"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-black hover:bg-neutral-800 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer disabled:opacity-50">
                {loading ? "Сохранение..." : "Обновить данные профиля"}
              </button>
            </form>
          </div>

        </div>

        <div className="w-full pt-2">
          <button
            onClick={handleLocalLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl transition cursor-pointer font-bold text-base shadow-lg text-center tracking-wide block"
          >
            Выйти из аккаунта
          </button>
        </div>

      </div>
    </div>
  );
}
