import React from "react";

export default function ActionItemList({ actionItems, actions, onCreate }) {
  return (
    <ul className="list-disc ml-6">
      {actionItems?.map((item, idx) => {
        const action = (actions || []).find(a => a.title === item.title);
        return (
          <li key={idx} className="mb-2 flex items-center gap-2">
            <div className="flex-1">
              {item.owner ? <span className="font-semibold">{item.owner}:</span> : null} {item.title || item.task}
              {item.due_date ? <span className="ml-2 text-blue-600">(Due: {item.due_date})</span> : null}
              {action?.issue_url ? (
                <a
                  href={action.issue_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition"
                >
                  Issue ↗
                </a>
              ) : null}
              {action?.ics_path ? <span className="ml-2 text-purple-600">[Calendar Event]</span> : null}
            </div>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => onCreate(item)}
            >
              Create
            </button>
          </li>
        );
      })}
    </ul>
  );
}
