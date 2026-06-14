import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function RoomPage({ user }) {
  const { id } = useParams();
  
  // МГНОВЕННЫЙ СТАРТ: Ищем параметры комнаты в локальном кэше, чтобы экран ЗАГРУЗКИ вообще не появлялся
  const [room, setRoom] = useState(() => {
    const cachedRooms = JSON.parse(localStorage.getItem("cached_rooms")) || [];
    return cachedRooms.find((r) => r.id === id) || null;
  });
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const fetchRoomAndMessages = async () => {
    try {
      // 1. Подтягиваем инфо о комнате без опасного метода .single()
      const { data: roomData } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id);
      
      if (roomData && roomData.length > 0) {
        setRoom(roomData[0]);
      }

      // 2. Подтягиваем историю сообщений из чата этой комнаты
      const { data: msgData } = await supabase
        .from("room_messages")
        .select("*")
        .eq("room_id", id)
        .order("created_at", { ascending: true });

      if (msgData) {
        setMessages(msgData);
      }
    } catch (err) {
      console.error("Ошибка загрузки данных из чата Supabase:", err);
    }
  };

  useEffect(() => {
    fetchRoomAndMessages();

    // Включаем real-time подписку, чтобы сообщения прилетали на лету
    const channel = supabase
      .channel(`room-chat-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_messages", filter: `room_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => {
            // Предотвращаем дублирование сообщений на экране
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const newLocalMsg = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      username: user.username,
      text: text.trim(),
      created_at: new Date().toISOString(),
      room_id: id
    };

    // Оптимистичный UI: мгновенно выводим текст на экран чата
    setMessages((prev) => [...prev, newLocalMsg]);
    setText("");

    try {
      await supabase.from("room_messages").insert([
        {
          room_id: id,
          username: user.username,
          text: text.trim()
        }
      ]);
    } catch (err) {
      console.error("Ошибка фоновой отправки сообщения в Supabase:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Запасной демонстрационный вариант, если комната только что создана и еще синхронизируется
  const currentRoom = room || {
    title: "Тематический чат",
    description: "Пространство для обмена мнениями участников платформы.",
    username: "Автор"
  };

  return (
    <div className="min-h-screen text-white px-8 py-10 overflow-x-hidden">
      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА: ИНФО О КОМНАТЕ */}
        <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white text-black rounded-3xl p-6 border border-neutral-200 w-full shadow-sm">
            <h1 className="text-3xl font-bold mb-3 tracking-tight break-words text-black">{currentRoom.title}</h1>
            <p className="text-neutral-600 text-sm break-words leading-relaxed">{currentRoom.description}</p>
            <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-400 font-semibold">Владелец: @{currentRoom.username}</div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 flex flex-col w-full shadow-sm">
            <div className="border border-neutral-200 rounded-2xl p-3 focus-within:border-neutral-400 transition bg-neutral-50">
              <textarea 
                className="w-full text-black min-h-[90px] resize-none outline-none text-base border-0 p-0 m-0 bg-transparent block" 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Напишите сообщение..." 
                onKeyDown={handleKeyDown} 
              />
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={sendMessage} className="bg-black hover:bg-neutral-800 text-white px-6 py-2 rounded-xl font-medium text-sm transition cursor-pointer shadow-sm w-full text-center block">
                Отправить
              </button>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ЛЕНТА СООБЩЕНИЙ ЧАТА */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md border border-neutral-800 rounded-3xl p-10 text-center text-neutral-400">
              Здесь пока пусто. Станьте первым!
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="bg-white text-black rounded-3xl p-6 border border-neutral-100 min-w-0 shadow-sm">
                <div className="flex justify-between items-center mb-3 gap-4">
                  <span className="font-bold text-black truncate">@{m.username}</span>
                  <span className="text-xs text-neutral-400 shrink-0">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="text-neutral-800 text-base whitespace-pre-wrap break-words min-w-0 [word-break:break-word] leading-relaxed">
                  {m.text}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
