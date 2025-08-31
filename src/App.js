import React, { useState } from "react";
import "./index.css";
import products from "./products.json";

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [urlPreview, setUrlPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFilePreview(URL.createObjectURL(file));
      setResults([]);
      setSearched(false);
    }
  };

  // Extract keywords from filename
  const extractKeywords = (str) => {
    return str
      .split(".")[0]
      .toLowerCase()
      .split(/[^a-z0-9]+|_+/)
      .flatMap((word) => word.split(/(?=[A-Z])/))
      .filter(Boolean);
  };

  // Search function with similarity score
  const searchProducts = (keywords) => {
    const filtered = products
      .map((product) => {
        const matchCount = product.tags.filter((tag) =>
          keywords.some((word) => tag.toLowerCase().includes(word))
        ).length;
        return { ...product, score: matchCount };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score); // highest similarity first

    return filtered;
  };

  // Search based on uploaded file
  const handleFileSearch = () => {
    if (!imageFile) return alert("Please upload an image first!");
    setLoading(true);

    const keywords = extractKeywords(imageFile.name);
    const filtered = searchProducts(keywords);

    setResults(filtered);
    setLoading(false);
    setSearched(true);
  };

  // Search based on URL input
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return alert("Please enter a URL!");
    setUrlPreview(imageUrl);
    setResults([]);
    setLoading(true);

    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1];
    const keywords = extractKeywords(filename);

    const filtered = searchProducts(keywords);

    setResults(filtered);
    setLoading(false);
    setSearched(true);
  };

  return (
    <div className="container">
      <h1>Visual Product Matcher</h1>

      {/* Upload + URL Section */}
      <div className="upload-box" style={{ marginBottom: "0" }}>
        {/* File Upload */}
        <div>
          <p>Upload a product image</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {filePreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={filePreview}
                alt="Uploaded File Preview"
                style={{ maxWidth: "200px", height: "auto" }}
              />
              <br />
              <button
                onClick={handleFileSearch}
                style={{ marginTop: "10px", padding: "5px 10px" }}
              >
                Search
              </button>
            </div>
          )}
        </div>

        {/* URL Input */}
        <div style={{ marginTop: "10px" }}>
          <p>Or enter an image URL</p>
          <form onSubmit={handleUrlSubmit}>
            <input
              type="text"
              placeholder="Paste image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ width: "70%", padding: "5px" }}
            />
            <button
              type="submit"
              style={{ padding: "5px 10px", marginLeft: "5px" }}
            >
              Search
            </button>
          </form>
          {urlPreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={urlPreview}
                alt="URL Preview"
                style={{ maxWidth: "200px", height: "auto" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {loading && <p>Searching...</p>}
      {results.length > 0 && (
        <div>
          <h2>Matching Products</h2>
          <div className="results">
            {results.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <p><strong>{product.name}</strong></p>
                <p>Price: {product.price}</p>
                <p>Similarity Score: {product.score}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!loading && searched && results.length === 0 && (
        <p>No matching products found.</p>
      )}
      {!loading && !searched && (
        <p>No results yet. Upload or paste URL to search.</p>
      )}
    </div>
  );
}

export default App;
