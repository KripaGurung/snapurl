import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiDownload, FiShare2 } from "react-icons/fi";
import "./CreateUrl.css";

function CreateUrl() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [msgType, setMsgType] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgQrUrl, setMsgQrUrl] = useState("");

  const navigate = useNavigate();

  /* =====================
     URL SHORTENER
  ===================== */
  const handleCreate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post(
        "/urls/",
        { original_url: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShortUrl(res.data.short_url);
      setShortCode(res.data.short_code);
      setQrImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to shorten URL");
    }
  };

  const generateQR = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const res = await api.get(`/urls/${shortCode}/qr`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const imageURL = URL.createObjectURL(res.data);
      setQrImage(imageURL);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("QR generation failed");
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `snapurl-${shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "SnapUrl QR Code",
        text: "Scan this QR to open the short URL",
        url: shortUrl,
      });
    } else {
      await navigator.clipboard.writeText(shortUrl);
      alert("Short URL copied to clipboard!");
    }
  };

  const generateMessageQR = async () => {
    if (!msgType || !msgContent.trim()) {
      alert("Select message type and write message");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post(
        "/messages/",
        { type: msgType, content: msgContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsgQrUrl(res.data.qr_url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate Message QR");
    }
  };

  const handleDownloadMessageQR = () => {
    const link = document.createElement("a");
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${msgQrUrl}`;
    link.download = "snapurl-message-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareMessageQR = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "SnapUrl Message QR",
        text: "Scan this QR to view the message",
        url: msgQrUrl,
      });
    } else {
      await navigator.clipboard.writeText(msgQrUrl);
      alert("Message QR link copied!");
    }
  };

  return (
    <div className="app-container">
      <section className="section url-section">
        <h1>URL Shortener</h1>
        <p className="section-desc"> Convert long URLs into short, shareable links instantly. </p>

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
              <p className="qr-title">QR for Short URL</p>
              <img src={qrImage} alt="QR Code" />
              <p>Scan to open original URL</p>

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
              <button className="yes" onClick={generateQR}>Yes</button>
              <button className="no" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      <section className="section message-section">
        <h1>Message QR</h1>
        <p className="section-desc"> Write a message and generate a QR code that displays it when scanned. </p>

        <div className="message-panel">
          <div className="message-actions">
            <button className={msgType === "plain" ? "active" : ""} onClick={() => setMsgType("plain")}>Plain Text</button>
            <button className={msgType === "note" ? "active" : ""} onClick={() => setMsgType("note")}>Note</button>
            <button className={msgType === "alert" ? "active" : ""} onClick={() => setMsgType("alert")}>Alert</button>
          </div>

          <textarea className="message-input" placeholder="Add your text here..." disabled={!msgType} value={msgContent} onChange={(e) => setMsgContent(e.target.value)} />

          <button className="generate-message-btn" onClick={generateMessageQR} disabled={!msgType || !msgContent.trim()}> Generate Message QR </button>
        </div>

        {msgQrUrl && (
          <div className="qr-center">
            <div className="qr-box">
              <p className="qr-title">QR for Message</p>

              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${msgQrUrl}`} alt="Message QR" />

              <p>Scan to view message</p>

              <div className="qr-actions">
                <button onClick={handleDownloadMessageQR}> <FiDownload /> </button>
                <button onClick={handleShareMessageQR}> <FiShare2 /> </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default CreateUrl;