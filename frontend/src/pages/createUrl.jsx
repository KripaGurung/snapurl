import { useState } from "react";
import api from "../services/api";

function CreateUrl() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

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

      setShortUrl(res.data.short_url);
    } catch {
      alert("Error creating short URL");
    }
  };

  return (
    <div style={{ marginTop: "50px", textAlign: "center" }}>

      <h2>Create Short URL</h2>

      <input type="text" placeholder="Enter long URL" onChange={(e) => setUrl(e.target.value)} />

      <br /><br />

      <button onClick={handleCreate}>Shorten</button>

      {shortUrl && ( <p> Short URL: <a href={shortUrl}>{shortUrl}</a> </p> )}
    </div>
  );
}

export default CreateUrl;