import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./messageView.css";

function MessageView() {
  const { token } = useParams();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid message link");
      setLoading(false);
      return;
    }

    const fetchMessage = async () => {
      try {
        const res = await api.get(
          `/message-qr/messages/m/${token}`
        );
        setMessage(res.data);
      } catch (err) {
        console.error("Message QR fetch failed:", err);
        setError("Message not found or expired");
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [token]);

  if (loading) {
    return <div className="message-page">Loading...</div>;
  }

  if (error) {
    return <div className="message-page error">{error}</div>;
  }

  return (
    <div className="message-page">
      <div className={`message-card ${message.type}`}>
        <h2>Message</h2>
        <p>{message.content}</p>
      </div>
    </div>
  );
}

export default MessageView;