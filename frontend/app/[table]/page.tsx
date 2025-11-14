"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TablePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const [table, setTable] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [stars, setStars] = useState(5);
  const [loading, setLoading] = useState(true);

  // 🔍 Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const productId = 1;
  const userId = 1;

  // -------------------------------
  //        UNWRAP PARAMS
  // -------------------------------
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setTable(resolvedParams.table);
    })();
  }, [params]);

  // -------------------------------
  //   FETCH MAIN TABLE DATA
  // -------------------------------
  useEffect(() => {
    if (!table) return;

    axios
      .get(`http://localhost:5000/api/${table}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [table]);

  // -------------------------------
  //     LOAD COMMENTS
  // -------------------------------
  const loadComments = () => {
    axios
      .get(`http://localhost:5000/api/comment/${productId}`)
      .then((res) => setComments(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadComments();
  }, []);

  // -------------------------------
  //     SUBMIT NEW COMMENT
  // -------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/comment", {
        UserId: userId,
        ProductID: productId,
        Content: newComment,
        Stars: stars,
      });

      setNewComment("");
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------
  //       UPDATE COMMENT
  // -------------------------------
  const handleEditComment = async (comment: any) => {
    const newContent = prompt("Edit comment:", comment.Content);
    if (!newContent) return;

    const newStars = prompt("Edit stars (1-5):", comment.Stars);
    if (!newStars) return;

    try {
      await axios.put(`http://localhost:5000/api/comment/${comment.CommentID}`, {
        Content: newContent,
        Stars: Number(newStars),
      });

      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------
  //       DELETE COMMENT
  // -------------------------------
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/comment/${commentId}`);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------
  //          SEARCH FUNCTION
  // -------------------------------
  const handleSearch = async () => {
    if (!searchQuery.trim() || !table) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/search/${table}?q=${searchQuery}`
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------
  //          RENDER UI
  // -------------------------------
  if (!table || loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{table.toUpperCase()} Data</h2>

      {/* SEARCH BAR */}
      <div style={{ margin: "1.5rem 0" }}>
        <h3>🔎 Search {table.toUpperCase()}</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search in ${table}...`}
          style={{
            padding: "8px",
            width: "250px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: "#1976d2",
            color: "white",
            padding: "8px 12px",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Search
        </button>
      </div>

      {/* SEARCH RESULTS TABLE */}
      {searchResults.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>🔍 Search Results</h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                {Object.keys(searchResults[0]).map((key) => (
                  <th
                    key={key}
                    style={{
                      borderBottom: "2px solid #ddd",
                      padding: "6px",
                      background: "#fafafa",
                    }}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {searchResults.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "6px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {val?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MAIN DATA TABLE */}
      {data.length > 0 ? (
        <table
          className="data-table"
          style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem" }}
        >
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  style={{ borderBottom: "2px solid #ccc", padding: "8px" }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {val?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data found.</p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      {/* COMMENTS SECTION */}
      <h3>💬 Comments</h3>

      {comments.length ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {comments.map((c) => (
            <li
              key={c.CommentID}
              style={{
                background: "#f9f9f9",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              <strong>⭐ {c.Stars}</strong> — {c.Content}
              <div style={{ marginTop: "8px" }}>
                <button
                  onClick={() => handleEditComment(c)}
                  style={{
                    marginRight: "10px",
                    padding: "4px 8px",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Update
                </button>

                <button
                  onClick={() => handleDeleteComment(c.CommentID)}
                  style={{
                    padding: "4px 8px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      {/* COMMENT FORM */}
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <textarea
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            height: "80px",
          }}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />

        <div style={{ marginTop: "0.5rem" }}>
          <label>
            Stars:
            <select
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              style={{ marginLeft: "0.5rem", padding: "4px" }}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "1rem",
            backgroundColor: "#1976d2",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
