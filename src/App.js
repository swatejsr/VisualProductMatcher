import React, { useState } from "react";
import "./index.css";
import products from "./products.json";

function App() {
  // State for uploaded image, previews, URL input, search results, loading, and search status
  const [imageFile, setImageFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [urlPreview, setUrlPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Handle image selection from user device
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setFilePreview(URL.createObjectURL(file));
    setResults([]); // clear previous results
    setSearched(false); // reset search status
  };

  // Helper: extract keywords from filename to match tags
  const extractKeywords = (filename) => {
    return filename
      .split(".")[0] // remove file extension
      .toLowerCase()
      .split(/[^a-z0-9]+|_+/) // split on non-alphanumeric or underscores
      .flatMap((word) => word.split(/(?=[A-Z])/)) // split camelCase words
      .filter(Boolean); // remove empty strings
  };

  // Main search function: calculates similarity score and sorts by it
  const searchProducts = (keywords) => {
    const filtered = products
      .map((product) => {
        // Count how many keywords match product tags
        const matchCount = product.tags.filter((tag) =>
          keywords.some((word) => tag.toLowerCase().includes(word))
        ).length;

        return { ...product, score: matchCount }; // attach similarity score
      })
      .filter((p) => p.score > 0) // only keep products with at least 1 match
      .sort((a, b) => b.score - a.score); // sort descending by score

    return filtered;
  };

  // Trigger search for uploaded image
  const handleFileSearch = () => {
    if (!imageFile) return alert("Please upload an image first!");

    setLoading(true);
    const keywords = extractKeywords(imageFile.name);
    const filteredResults = searchProducts(keywords);

    setResults(filteredResults);
    setLoading(false);
    setSearched(true);
  };

  // Trigger search for URL input
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return alert("Please enter a URL!");

    setUrlPreview(imageUrl);
    setResults([]);
    setLoading(true);

    const filename = imageUrl.split("/").pop(); // get filename from URL
    const keywords = extractKeywords(filename);
    const filteredResults = searchProducts(keywords);

    setResults(filteredResults);
    setLoading(false);
    setSearched(true);
  };

  return (
    <div className="container">
      <h1>Visual Product Matcher</h1>

      {/* Upload and URL input section */}
      <div className="upload-box">
        {/* Upload from device */}
        <div>
          <p>Upload a product image</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {filePreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={filePreview}
                alt="Preview of uploaded file"
                style={{ maxWidth: "200px", height: "auto" }}
              />
              <br />
              <button onClick={handleFileSearch} style={{ marginTop: "10px", padding: "5px 10px" }}>
                Search
              </button>
            </div>
          )}
        </div>

        {/* URL input */}
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
            <button type="submit" style={{ padding: "5px 10px", marginLeft: "5px" }}>
              Search
            </button>
          </form>
          {urlPreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={urlPreview}
                alt="Preview of URL"
                style={{ maxWidth: "200px", height: "auto" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Display search results */}
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
      {!loading && searched && results.length === 0 && <p>No matching products found.</p>}
      {!loading && !searched && <p>No results yet. Upload an image or paste a URL to start searching.</p>}
    </div>
  );
}

export default App;
