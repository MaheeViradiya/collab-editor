import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const socket = io("http://localhost:5000");

export default function EditorUI() {
  const [value, setValue] = useState("");

  useEffect(() => {
    const id = window.location.pathname.split("/").pop() || "demo-doc";

    socket.emit("get-document", id);

    socket.on("load-document", (data) => setValue(data));
    socket.on("receive-changes", (data) => setValue(data));
  }, []);

  const handleChange = (content) => {
    setValue(content);
    socket.emit("send-changes", content);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("save-document", value);
    }, 2000);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #470253, #6d28d9)",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "white", textAlign: "center" }}>🚀 Collab Editor</h1>
      <div
        style={{ background: "white", borderRadius: "50px", padding: "10px" , height: "80vh"}}
        
      >
        <ReactQuill value={value} onChange={handleChange} style={{ height: "90%", border: "none" }} />
      </div>
    </div>
  );
}
