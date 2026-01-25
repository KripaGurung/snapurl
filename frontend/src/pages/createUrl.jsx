import { useState } from "react";
import api from "../services/api";
import "./CreateUrl.css";

function CreateUrl() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleCreate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await api.post(
        "/urls/",
        { original_url: url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("URL shortened successfully");
      setShortUrl(res.data.short_url);
      setShortCode(res.data.short_code);
    } catch {
      alert("Error creating short URL");
    }
  };

  return (
    <div className="createUrlContainer">
      <h2>Create Short URL</h2>

      <label>Enter URL</label>
      <input type="text" placeholder="Enter long URL" onChange={(e) => setUrl(e.target.value)} />

      <button onClick={handleCreate}>Shorten</button>

      {shortUrl && (
        <>
          <p className="result"> Short URL: <a href={shortUrl}>{shortUrl}</a> </p>

          <button onClick={() => setShowQR(true)}> Generate QR </button>
        </>
      )}

      {showQR && ( <img src={`http://127.0.0.1:8000/urls/${shortCode}/qr`} alt="QR Code" width="200" />
      )}
    </div>
  );
}

export default CreateUrl;