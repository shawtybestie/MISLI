import { useState } from "react";

export default function Home({ user }) {
  const [text, setText] = useState("");

  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "Alex",
      text: "Первый пост в нашем форуме",
      time: "сейчас"
    },
    {
      id: 2,
      username: "John",
      text: "Похоже на Reddit, но без рейтингов 😄",
      time: "1 мин назад"
    }
  ]);

  const addPost = () => {
    if (!text.trim()) return;

    const newPost = {
      id: Date.now(),
      username: user?.username || "Anon",
      text,
      time: "сейчас"
    };

    setPosts([newPost, ...posts]);
    setText("");
  };

  return (
    <div className="container">

      {/* МЫСЛЬ ДНЯ */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="title">Мысль дня</h2>
        <p className="small">
          Форум без рейтингов и лайков — только общение.
        </p>
      </div>

      {/* ФОРМА (REDDIT STYLE) */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Создать пост..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#0a0a0a",
              color: "white"
            }}
          />

          <button className="button" onClick={addPost}>
            Post
          </button>
        </div>
      </div>

      {/* ПОСТЫ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {posts.map((post) => (
          <div
            key={post.id}
            className="card"
            style={{ display: "flex", gap: 12 }}
          >

            {/* AVATAR */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "white",
                color: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}
            >
              {post.username[0].toUpperCase()}
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <strong>{post.username}</strong>
                <span className="small">• {post.time}</span>
              </div>

              <p style={{ marginTop: 6 }}>{post.text}</p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}