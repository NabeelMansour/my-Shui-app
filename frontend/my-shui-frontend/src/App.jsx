import { useEffect, useState } from "react";

import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");

  function handleIconClick(e) {
    const action = e.currentTarget.dataset.action;
    const id = e.currentTarget.dataset.id;

    if (action === "edit") {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, text: msg.text } : msg))
      );
    }

    if (action === "delete") {
      fetch(
        `https://erla64brig.execute-api.eu-north-1.amazonaws.com/api/messages/${id}`,
        {
          method: "PUT",
        }
      )
        .then((res) => res.json())
        .then(() => {
          setMessages((prev) => prev.filter((msg) => msg.id !== id));
        })
        .catch((err) => console.log(err));
    }
  }

  function handleSave(id) {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, text: editText } : msg))
    );

    fetch(`https://din-api/messages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText }),
    }).catch((err) => console.log(err));

    setEditingId(null);
    setEditText("");
  }

  useEffect(() => {
    fetch(
      "https://erla64brig.execute-api.eu-north-1.amazonaws.com/api/messages"
    )
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch((err) => console.log(err));
  }, []);

  async function handleAddMessage() {
    if (!newMessage.trim()) return;

    const createMessage = {
      username: username,
      text: newMessage,
    };

    try {
      const res = await fetch(
        "https://erla64brig.execute-api.eu-north-1.amazonaws.com/api/messages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createMessage),
        }
      );

      const data = await res.json();

      // Update frontend instantly with new message
      setMessages((prev) => [...prev, data[0] || payload]);

      // Close modal and reset input
      setNewMessage("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding message:", err);
    }
  }

  return (
    <main>
      <h3>Message Board</h3>
      <section className="message-list">
        {messages.length === 0 ? (
          <h2 className="">No messages written 👀</h2>
        ) : (
          <ul>
            {messages.map((msg) => (
              <li key={msg.id}>
                <span className="date">{msg.createdAtFormatted}</span>
                {editingId === msg.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <p className="text">{msg.text}</p>
                )}

                <div className="message-bottom">
                  <p className="username">&#8213; {msg.username}</p>
                  <div>
                    <i
                      className="fa-solid fa-pencil"
                      data-id={msg.id}
                      onClick={() => {
                        setEditingId(msg.id);
                        setEditText(msg.text);
                      }}
                    ></i>
                    <i
                      className="fa-solid fa-trash"
                      data-id={msg.id}
                      data-action="delete"
                      onClick={handleIconClick}
                    ></i>

                    {editingId === msg.id && (
                      <button onClick={() => handleSave(msg.id)}>Save</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <i
          className="fa-solid fa-square-pen"
          data-action="add"
          onClick={() => setIsModalOpen(true)}
        ></i>
      </section>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add a message</h3>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={handleAddMessage}>Save</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
