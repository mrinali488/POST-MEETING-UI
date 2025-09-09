
import React, { useState } from "react";
import ActionItemList from "./ActionItemList";
import ActionItemModal from "./ActionItemModal";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [log, setLog] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
    setLog("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setLog("");
    try {
      const formData = new FormData();
      formData.append("file", file); // match curl field name
      setLog(`POST http://127.0.0.1:8000/ingest_audio with file: ${file.name}`);
      const res = await fetch("http://127.0.0.1:8000/ingest_audio", {
        method: "POST",
        body: formData,
      });
      setLog((prev) => prev + `\nStatus: ${res.status}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process audio");
        setLog((prev) => prev + `\nError: ${data.error || "Unknown error"}` + (data.traceback ? `\nTraceback:\n${data.traceback}` : ""));
      } else {
        setResult(data);
        setLog((prev) => prev + "\nSuccess: Audio processed.");
      }
    } catch (err) {
      setError(err.message);
      setLog((prev) => prev + `\nException: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Post-Meeting Agent</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".wav,.mp3,audio/wav,audio/mp3"
            onChange={handleFileChange}
            className="file-input file-input-bordered"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !file}
          >
            {loading ? "Processing..." : "Upload & Analyze"}
          </button>
        </form>
        {error && <div className="mt-4 text-red-600">Error: {error}</div>}
        {log && (
          <pre className="mt-4 bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-48">{log}</pre>
        )}
        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Insights</h2>
            <div className="mb-2"><strong>Summary:</strong> {result.insights?.summary || result.summary}</div>
            <div className="mb-2"><strong>Decisions:</strong> {Array.isArray(result.insights?.decisions) ? result.insights.decisions.join(", ") : result.decisions}</div>
            <div className="mb-2">
              <strong>Action Items:</strong>
              <ActionItemList
                actionItems={result.insights?.action_items || result.action_items}
                actions={result.actions}
                onCreate={item => {
                  setModalItem(item);
                  setShowModal(true);
                }}
              />
              {showModal && (
                <ActionItemModal
                  actionItems={result.insights?.action_items || result.action_items}
                  initialItem={modalItem}
                  taskOwners={result.task_owners}
                  onClose={() => setShowModal(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
