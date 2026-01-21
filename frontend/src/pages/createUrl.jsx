import { useState } from "react";
import api from "../services/api";
import "./CreateUrl.css";

function CreateUrl() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleCreate = async () => {
  console.log("Create button clicked");

  const token = localStorage.getItem("token");
  console.log("Token:", token);

  if (!token) {
    alert("Please login first");
    return;
  }

  if (!url.trim()) {
    alert("Please enter a URL");
    return;
  }

  try {
    const res = await api.post(
      "/urls/",
      { original_url: url },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Short URL response:", res.data);
    setShortUrl(res.data.short_url);
  } catch (err) {
    console.error(
      "Create URL error:",
      err.response?.data || err.message
    );
    alert("Error creating short URL");
  }
};


  return (
    <div className="createUrlContainer">
      <h2>Create Short URL</h2>

      <label>Enter URL</label>
      <input type="text" placeholder="Enter long URL" onChange={(e) => setUrl(e.target.value)} />

      <button onClick={handleCreate}>Shorten</button>

      {shortUrl && ( <p className="result"> Short URL: <a href={shortUrl}>{shortUrl}</a> </p> )}
    </div>
  );
}

export default CreateUrl;