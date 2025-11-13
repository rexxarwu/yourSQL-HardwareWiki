"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TablePage({ params }: { params: Promise<{ table: string }> }) {
  const [table, setTable] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [stars, setStars] = useState(5);
  const [loading, setLoading] = useState(true);

  const productId = 1;
  const userId = 1;

  // ✅ unwrap params using React.use()
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setTable(resolvedParams.table);
    })();
  }, [params]);

  // ✅ fetch data once table is available
  useEffect(() => {
    if (!table) return;
    axios
      .get(`http://localhost:5000/api/${table}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [table]);

  // ✅ fetch comments
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/comment/${productId}`)
      .then((res) => setComments(res.data))
      .catch(console.error);
  }, []);

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
      const res = await axios.get(`http://localhost:5000/api/comment/${productId}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!table || loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>{table.toUpperCase()} Data</h2>
      {data.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j}>{val?.toString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data found.</p>
      )}

      <hr style={{ margin: "2rem 0" }} />
      <h3>💬 Comments</h3>
      {comments.length ? (
        <ul>
          {comments.map((c) => (
            <li key={c.CommentID}>
              <strong>⭐ {c.Stars}</strong> — {c.Content}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <textarea
          style={{ width: "100%", padding: "8px", marginTop: "0.5rem" }}
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
              style={{ marginLeft: "0.5rem" }}
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
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
