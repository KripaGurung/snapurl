import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiDownload, FiShare2 } from "react-icons/fi";
import { useAuth } from "../context/useAuth";
import "./createUrl.css";

function CreateUrl() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [qrImage, setQrImage] = useState(null);

  const [msgType, setMsgType] = useState("");
  const [msgContent, setMsgContent] = useState("");

  const navigate = useNavigate();
  const { token } = useAuth();

  const handleCreate = async () => {
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/shortener/urls/", {
        original_url: url,
      });

      setShortUrl(res.data.short_url);
      setShortCode(res.data.short_code);
      setQrImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to shorten URL");
    }
  };

  const generateQR = async () => {
    try {
      const res = await api.get(`/shortener/urls/${shortCode}/qr`, {
        responseType: "blob",
      });

      const imageURL = URL.createObjectURL(res.data);
      setQrImage(imageURL);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("QR generation failed");
    }
  };

  const generateMessageQR = async () => {
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!msgType || !msgContent.trim()) {
      alert("Select message type and write message");
      return;
    }

    try {
      const res = await api.post("/message-qr/messages", {
        type: msgType,
        content: msgContent,
      });

      const token = res.data.token;

      const qrRes = await api.get(
        `/message-qr/messages/${token}/qr`,
        { responseType: "blob" }
      );

      const imageURL = URL.createObjectURL(qrRes.data);
      setQrImage(imageURL);
    } catch (err) {
      console.error(err);
      alert("Failed to generate Message QR");
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = "snapurl-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "SnapUrl QR",
        text: "Scan this QR",
      });
    } else {
      alert("Sharing not supported on this device");
    }
  };

  return (
    <div className="app-container">
      <section className="section url-section">
        <h1>URL Shortener</h1>
        <p className="section-desc">
          Convert long URLs into short, shareable links instantly.
        </p>

        <div className="container">
          <div className="card">
            <h2>Enter URL</h2>
            <input placeholder="Paste your long URL here..." value={url} onChange={(e) => setUrl(e.target.value)} />
            <button onClick={handleCreate}>Convert</button>
          </div>

          <div className="card">
            <h2>Short URL</h2>

            {shortUrl ? (
              <>
                <a href={shortUrl} target="_blank" rel="noreferrer" className="short-link"> {shortUrl} </a>

                <button style={{ marginTop: "12px" }} onClick={() => setShowModal(true)}> Generate QR </button>
              </>
            ) : (
              <p className="muted">Your short URL will appear here</p>
            )}
          </div>
        </div>

        {qrImage && (
          <div className="qr-center">
            <div className="qr-box">
              <p className="qr-title">QR Code</p>
              <img src={qrImage} alt="QR Code" />

              <div className="qr-actions">
                <button onClick={handleDownloadQR}> <FiDownload /> </button>
                <button onClick={handleShareQR}> <FiShare2 /> </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Do you want to generate QR?</h3>
            <div className="modal-buttons">
              <button className="yes" onClick={generateQR}> Yes </button>
              <button className="no" onClick={() => setShowModal(false)}> No </button>
            </div>
          </div>
        </div>
      )}

      <section className="section message-section">
        <h1>Message QR</h1>
        <p className="section-desc"> Write a message and generate a QR code that displays it when scanned. </p>

        <div className="message-panel">
          <div className="message-actions">
            <button className={msgType === "plain" ? "active" : ""} onClick={() => setMsgType("plain")} > Plain Text </button>
            <button className={msgType === "note" ? "active" : ""} onClick={() => setMsgType("note")} > Note </button>
            <button className={msgType === "alert" ? "active" : ""} onClick={() => setMsgType("alert")}> Alert </button>
          </div>

          <textarea className="message-input" placeholder="Add your text here..." disabled={!msgType} value={msgContent} onChange={(e) => setMsgContent(e.target.value)} />

          <button className="generate-message-btn" onClick={generateMessageQR} disabled={!msgType || !msgContent.trim()}> Generate Message QR </button>
        </div>
      </section>
    </div>
  );
}

export default CreateUrl;