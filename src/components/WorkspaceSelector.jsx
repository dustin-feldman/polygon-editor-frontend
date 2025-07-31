import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setWorkspaces,
  setSelectedWorkspace,
} from "../store/workspaceSlice";
import { fetchWorkspaces } from "../api/workspace"; // Assumes you return axios.get("/workspaces")

export default function WorkspaceSelector({ onSelect }) {
  const dispatch = useDispatch();
  const workspaces = useSelector((state) => state.workspaces.items);
  const selectedId = useSelector((state) => state.workspaces.selectedId);

  const selected = workspaces.find((ws) => ws.id === selectedId) || null;

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Fetch and set workspaces
  useEffect(() => {
    fetchWorkspaces()
      .then((res) => {
        if (Array.isArray(res.data)) {
          dispatch(setWorkspaces(res.data));

          // Select first by default (optional)
          if (res.data.length > 0 && !selectedId) {
            dispatch(setSelectedWorkspace(res.data[0].id));
            onSelect?.(res.data[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Update parent on change
  useEffect(() => {
    if (selectedId) onSelect?.(selectedId);
  }, [selectedId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-64" ref={containerRef}>
      <button
        type="button"
        className="w-full px-3 py-2 border border-gray-300 bg-white rounded shadow-sm text-left"
        onClick={() => setOpen(!open)}
      >
        {selected ? selected.name : "Select Workspace"}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow max-h-60 overflow-y-auto">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => {
                dispatch(setSelectedWorkspace(ws.id));
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                selectedId === ws.id ? "bg-blue-50 font-medium" : ""
              }`}
            >
              {ws.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
