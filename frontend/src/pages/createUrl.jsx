import { useState } from "react";
import api from "../services/api";
import "./CreateUrl.css";

function CreateUrl() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [qrImage, setQrImage] = useState(null);

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await api.post("/urls/", {
        original_url: url,
      });

      setShortUrl(res.data.short_url);
      setShortCode(res.data.short_code);
      setQrImage(null); // reset old QR
    } catch {
      alert("Failed to shorten URL");
    }
  };

  const generateQR = async () => {
    try {
      const res = await api.get(`/urls/${shortCode}/qr`, {
        responseType: "blob",
      });

      const imageURL = URL.createObjectURL(res.data);
      setQrImage(imageURL);
      setShowModal(false);
    } catch {
      alert("QR generation failed");
    }
  };

  return (
    <>
      <div className="container">

        <div className="card">
          <h2>Enter URL</h2>
          <input
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={handleCreate}>Convert</button>
        </div>

        <div className="card">
          <h2>Short URL</h2>

          {shortUrl ? (
            <>
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="short-link"
              >
                {shortUrl}
              </a>

              <button
                style={{ marginTop: "12px" }}
                onClick={() => setShowModal(true)}
              >
                Generate QR
              </button>
            </>
          ) : (
            <p className="muted">Your short URL will appear here</p>
          )}
        </div>
      </div>

      {qrImage && (
        <div className="qr-center">
          <div className="qr-box">
            <img src={qrImage} alt="QR Code" />
            <p>Scan to open original URL</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Do you want to generate QR?</h3>

            <div className="modal-buttons">
              <button className="yes" onClick={generateQR}>
                Yes
              </button>
              <button
                className="no"
                onClick={() => setShowModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateUrl;