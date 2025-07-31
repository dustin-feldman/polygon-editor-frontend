import { useEffect, useState } from "react";
import { fetchWorkspaces } from "../api/workspace";

export default function WorkspaceSelector({ onSelect }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkspaces()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setWorkspaces(res.data);
        } else {
          setWorkspaces([]);
          setError("Unexpected response format.");
        }
      })
      .catch((err) => {
        setWorkspaces([]);
        setError("Failed to load workspaces.");
        console.error(err);
      });
  }, []);

  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <select onChange={(e) => onSelect(e.target.value)} disabled={!!error}>
        <option value="">Select Workspace</option>
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name}
          </option>
        ))}
      </select>
    </>
  );
}
