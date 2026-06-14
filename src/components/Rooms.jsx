  import { useEffect, useState } from "react";

  export default function Rooms({ user }) {
    const [rooms, setRooms] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] =
      useState("");

    const [hasRoom, setHasRoom] =
      useState(false);

    useEffect(() => {
      const savedRooms =
        JSON.parse(
          localStorage.getItem("forum_rooms")
        ) || [];

      setRooms(savedRooms);

      const myRoom = savedRooms.find(
        (room) => room.userId === user.id
      );

      if (myRoom) {
        setHasRoom(true);
      }
    }, [user.id]);

    const createRoom = () => {
      if (!title.trim()) return;

      const newRoom = {
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.username,
        title,
        description,
        created_at: new Date(),
      };

      const updatedRooms = [
        newRoom,
        ...rooms,
      ];

      setRooms(updatedRooms);

      localStorage.setItem(
        "forum_rooms",
        JSON.stringify(updatedRooms)
      );

      setHasRoom(true);

      setTitle("");
      setDescription("");
    };

    return (
      <div className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">

          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">
              Авторские комнаты
            </h1>

            <p className="text-neutral-400">
              У каждого пользователя только
              одна комната.
            </p>
          </div>

          {!hasRoom ? (
            <div className="bg-white text-black rounded-2xl p-6 mb-10">
              <h2 className="text-2xl font-bold mb-4">
                Создать комнату
              </h2>

              <input
                type="text"
                placeholder="Название"
                className="w-full border border-neutral-300 rounded-xl p-3 mb-4"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <textarea
                placeholder="Описание"
                className="w-full border border-neutral-300 rounded-xl p-3 min-h-[120px]"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

              <button
                onClick={createRoom}
                className="mt-4 bg-black text-white px-6 py-3 rounded-xl hover:bg-neutral-800"
              >
                Создать свою комнату
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 mb-10">
              <p className="text-neutral-300">
                Вы уже создали свою авторскую
                комнату
              </p>
            </div>
          )}

          {/* Rooms */}
          <div className="grid md:grid-cols-2 gap-5">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white text-black rounded-2xl p-6"
              >
                <h3 className="text-2xl font-bold mb-2">
                  {room.title}
                </h3>

                <p className="text-neutral-600 mb-5">
                  {room.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">
                    @{room.username}
                  </span>

                  <button className="bg-black text-white px-4 py-2 rounded-lg">
                    Войти
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }