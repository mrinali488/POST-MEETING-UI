import React from "react";

export default function ActionItemModal({ actionItems, initialItem, onClose, taskOwners, onActionCreated }) {
  const today = new Date().toISOString().slice(0, 10);
  // Prefer taskOwners if present, else fallback to old logic
  const owners = Array.isArray(taskOwners) && taskOwners.length > 0
    ? taskOwners.map(o => o.owner).filter(Boolean)
    : Array.from(new Set((actionItems || []).map(a => a.owner).filter(Boolean)));
  const base = initialItem || actionItems?.[0] || {};
  // Convert dd-mm-yyyy to yyyy-mm-dd if needed
  function normalizeDate(dateStr) {
    if (!dateStr) return today;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; // already yyyy-mm-dd
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    return today;
  }
  const [form, setForm] = React.useState({
    title: base.title || "",
    due_date: normalizeDate(base.due_date),
    priority: base.priority || "medium",
    owner: base.owner || (owners[0] || ""),
    details: base.details || "",
    task_id: base.task_id || ""
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    const idempotency_key = form.task_id || `task-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const payload = {
      title: form.title,
      due: form.due_date,
      owner: form.owner,
      priority: form.priority,
      details: form.details,
      idempotency_key
    };
    try {
      const res = await fetch("http://127.0.0.1:8000/actions/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create action");
      } else {
        const data = await res.json();
        setSuccess("Action created successfully!");
        if (onActionCreated && data?.raw?.issue_url && form.task_id) {
          onActionCreated(form.task_id, data.raw.issue_url);
        }
        // Close the modal after a short delay for user feedback
        setTimeout(() => {
          if (onClose) onClose();
        }, 500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-4">Create Action Item</h3>
        <form className="flex flex-col gap-3" onSubmit={handleCreate}>
          <label className="flex flex-col">
            <span className="font-medium">Title</span>
            <input name="title" value={form.title} onChange={handleChange} className="border rounded px-2 py-1" />
          </label>
          <label className="flex flex-col">
            <span className="font-medium">Due Date</span>
            <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="border rounded px-2 py-1" />
          </label>
          <label className="flex flex-col">
            <span className="font-medium">Priority</span>
            <select name="priority" value={form.priority} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="flex flex-col">
            <span className="font-medium">Owner</span>
            <select name="owner" value={form.owner} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="">-- Select Owner --</option>
              {owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="font-medium">Details</span>
            <textarea name="details" value={form.details} onChange={handleChange} className="border rounded px-2 py-1" rows={3} />
          </label>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex gap-2 mt-2">
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={onClose} disabled={loading}>Close</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating..." : "Create Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
