import React, { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  create_date: string;
  due_date: string;
}

type TabType = "list" | "create" | "edit" | "delete" | "status";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: "",
  });

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "pending",
  });

  const [editErrors, setEditErrors] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  // Delete Tab State
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const API_URL = "http://localhost:8800/api/tasks/";

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSelectTask = (id: number) => {
    setSelectedTaskId(id);
    setEditSuccess(false);

    const task = tasks.find((t) => t.id === id);
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        status: task.status,
      });
    }
  };

  // Handle Task Selection
  const handleSelectDeleteTask = (id: number) => {
    setDeleteTaskId(id);
    setDeleteSuccess(false);
    setShowConfirm(false);
  };

  const validateEdit = () => {
    const errors: any = {};

    if (!selectedTaskId) errors.selected = "Please select a task.";
    if (!editForm.title.trim()) errors.title = "Title is required.";
    if (!editForm.description.trim())
      errors.description = "Description is required.";

    setEditErrors(errors);

    return Object.keys(errors).length === 0;
  };


  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setSuccessMessage("");

      await axios.post(API_URL, formData);

      setSuccessMessage("Task created successfully!");
      setFormData({
        title: "",
        description: "",
        status: "pending",
        due_date: "",
      });

      fetchTasks();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateEdit()) return;

    setEditLoading(true);
    setEditSuccess(false);

    try {
      if (!selectedTaskId) return;

      // 1️⃣ Call Django backend API to update task
      await axios.put(`http://localhost:8800/api/tasks/${selectedTaskId}/`, {
        title: editForm.title,
        description: editForm.description,
        due_date: editForm.due_date,
        status: editForm.status, // make sure this matches the serializer
      });

      // 2️⃣ Update local frontend state after success
      setTasks(
        tasks.map((task) =>
          task.id === selectedTaskId
            ? {
              ...task,
              title: editForm.title,
              description: editForm.description,
              due_date: editForm.due_date,
              status: editForm.status as "pending" | "in_progress" | "completed", // <-- cast
            }
            : task
        )
      );

      setEditSuccess(true); // show success banner
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update task. Check console for details.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete with backend
  const handleDelete = async () => {
    if (!deleteTaskId) return;

    setDeleteLoading(true);

    try {
      // Call backend DELETE endpoint
      await axios.delete(`http://localhost:8800/api/tasks/${deleteTaskId}/`);

      // Update local state
      setTasks(prev => prev.filter(task => task.id !== deleteTaskId));

      setDeleteSuccess(true);
      setDeleteTaskId(null);
      setShowConfirm(false);

      // Hide success banner after 3 seconds
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete task. Check console for details.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderListTab = () => (
    <div style={tableWrapperStyle}>
      {tasks.length === 0 ? (
        <div style={emptyStateStyle}>No tasks available</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Due Date</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr
                key={task.id}
                style={{
                  ...tableRowStyle,
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                }}
              >
                <td style={tdStyle}>{task.title}</td>
                <td style={tdStyle}>{task.description}</td>
                <td style={tdStyle}>
                  {new Date(task.due_date).toLocaleDateString()}
                </td>
                <td style={tdStyle}>
                  <span style={getStatusBadge(task.status)}>
                    {task.status.replace("_", " ").toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderCreateTab = () => (
    <div style={formWrapperStyle}>
      <div style={formCardStyle}>
        <h2 style={formTitleStyle}>Create New Task</h2>

        {successMessage && (
          <div style={successBannerStyle}>{successMessage}</div>
        )}

        <div style={formGroupStyle}>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={formData.title}
            style={{
              ...inputStyle,
              ...(errors.title ? errorInputStyle : {}),
            }}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={formData.description}
            style={{
              ...textareaStyle,
              ...(errors.description ? errorInputStyle : {}),
            }}
            rows={4}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          {errors.description && (
            <span style={errorTextStyle}>{errors.description}</span>
          )}
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              style={{
                ...inputStyle,
                ...(errors.due_date ? errorInputStyle : {}),
              }}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
            />
            {errors.due_date && (
              <span style={errorTextStyle}>{errors.due_date}</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Status</label>
            <select
              value={formData.status}
              style={inputStyle}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <button
          style={{
            ...primaryButtonStyle,
            ...(loading ? disabledButtonStyle : {}),
          }}
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Task"}
        </button>
      </div>
    </div>
  );

  const renderEditTab = () => {
    return (
      <div style={formWrapperStyle}>
        <div style={formCardStyle}>
          <h2 style={formTitleStyle}>Edit Task</h2>

          {editSuccess && (
            <div style={successBannerStyle}>
              Task updated successfully.
            </div>
          )}

          {/* Task Selector */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Select Task</label>
            <select
              style={inputStyle}
              value={selectedTaskId || ""}
              onChange={(e) =>
                handleSelectTask(Number(e.target.value))
              }
            >
              <option value="">-- Choose a task --</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            {editErrors.selected && (
              <span style={errorTextStyle}>
                {editErrors.selected}
              </span>
            )}
          </div>

          {/* Empty State */}
          {!selectedTaskId && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Select a task to begin editing.
            </div>
          )}

          {/* Edit Form */}
          {selectedTaskId && (
            <>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Title</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      title: e.target.value,
                    })
                  }
                />
                {editErrors.title && (
                  <span style={errorTextStyle}>
                    {editErrors.title}
                  </span>
                )}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={4}
                  style={textareaStyle}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                />
                {editErrors.description && (
                  <span style={errorTextStyle}>
                    {editErrors.description}
                  </span>
                )}
              </div>

              <div style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Due Date</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={editForm.due_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status</label>
                  <select
                    style={inputStyle}
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">
                      In Progress
                    </option>
                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>
              </div>

              <button
                style={{
                  ...primaryButtonStyle,
                  opacity:
                    editForm.title.trim() &&
                      editForm.description.trim()
                      ? 1
                      : 0.6,
                  cursor:
                    editForm.title.trim() &&
                      editForm.description.trim()
                      ? "pointer"
                      : "not-allowed",
                }}
                disabled={
                  !editForm.title.trim() ||
                  !editForm.description.trim() ||
                  editLoading
                }
                onClick={handleUpdate}
              >
                {editLoading ? "Updating..." : "Update Task"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDeleteTab = () => {
    const selectedTask = tasks.find((t) => t.id === deleteTaskId);

    return (
      <div style={formWrapperStyle}>
        <div style={formCardStyle}>
          <h2 style={formTitleStyle}>Delete Task</h2>

          {deleteSuccess && (
            <div style={successBannerStyle}>Task deleted successfully.</div>
          )}

          {/* Task Selector */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Select Task</label>
            <select
              style={inputStyle}
              value={deleteTaskId || ""}
              onChange={(e) =>
                handleSelectDeleteTask(Number(e.target.value))
              }
            >
              <option value="">-- Choose a task --</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Empty State */}
          {!deleteTaskId && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Select a task to delete.
            </div>
          )}

          {/* Delete Button */}
          {deleteTaskId && (
            <>
              <button
                style={{
                  ...primaryButtonStyle,
                  backgroundColor: "#dc2626",
                  opacity: deleteLoading ? 0.6 : 1,
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                }}
                disabled={deleteLoading}
                onClick={() => setShowConfirm(true)}
              >
                {deleteLoading ? "Deleting..." : "Delete Task"}
              </button>

              {/* Confirmation Modal */}
              {showConfirm && (
                <div style={modalOverlayStyle}>
                  <div style={modalCardStyle}>
                    <p>
                      Are you sure you want to delete task:{" "}
                      <strong>{selectedTask?.title}</strong>?
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                      <button
                        style={{
                          ...primaryButtonStyle,
                          backgroundColor: "#dc2626",
                        }}
                        onClick={handleDelete}
                      >
                        Yes, Delete
                      </button>
                      <button
                        style={{
                          ...primaryButtonStyle,
                          backgroundColor: "#6b7280",
                        }}
                        onClick={() => setShowConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderStatusTab = () => {
    if (tasks.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          No tasks available.
        </div>
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {tasks.map((task) => (
          <div
            key={task.id}
            style={statusCardStyle}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, statusCardHoverStyle)
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, statusCardStyle)
            }
          >
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "#111827" }}>
              {task.title}
            </h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px" }}>
              Due: {task.due_date}
            </p>
            <span style={statusBadgeStyle(task.status)}>
              {task.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Task Management System</h1>

      {/* Tabs */}
      {/* Tabs */}
      <div style={tabContainerStyle}>
        {[
          { key: "list", label: "All Tasks" },
          { key: "create", label: "Create" },
          { key: "edit", label: "Edit" },
          { key: "delete", label: "Delete" },
          { key: "status", label: "Status View" },
        ].map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            style={{
              ...tabStyle,
              ...(activeTab === tab.key ? activeTabStyle : {}),
              borderRadius:
                index === 0
                  ? "8px 0 0 8px"
                  : index === 4
                    ? "0 8px 8px 0"
                    : "0",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "list" && renderListTab()}
      {activeTab === "create" && renderCreateTab()}
      {activeTab === "edit" && renderEditTab()}
      {activeTab === "delete" && renderDeleteTab()}
      {activeTab === "status" && renderStatusTab()}
    </div>
  );
}


const getStatusBadge = (status: string): React.CSSProperties => {
  let background = "#e2e8f0";
  let color = "#334155";

  if (status === "pending") {
    background = "#fef3c7";
    color = "#92400e";
  }

  if (status === "in_progress") {
    background = "#dbeafe";
    color = "#1e40af";
  }

  if (status === "completed") {
    background = "#dcfce7";
    color = "#166534";
  }

  return {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: background,
    color: color,
  };
};

const formWrapperStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
};

const formCardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "14px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  width: "100%",
  maxWidth: "500px",
};

const formTitleStyle: React.CSSProperties = {
  marginBottom: "20px",
  fontSize: "20px",
  fontWeight: 600,
  color: "#1e293b",
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: "18px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "6px",
  color: "#475569",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "none",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "10px",
  width: "100%",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: 600,
  fontSize: "14px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const errorTextStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "12px",
  marginTop: "4px",
};

const errorInputStyle: React.CSSProperties = {
  border: "1px solid #dc2626",
};

const successBannerStyle: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  color: "#166534",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "15px",
  fontSize: "14px",
  fontWeight: 500,
};

const disabledButtonStyle: React.CSSProperties = {
  opacity: 0.7,
  cursor: "not-allowed",
};


const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "10px",
  marginBottom: "10px",
};

const tabContainerStyle: React.CSSProperties = {
  display: "flex",
  marginBottom: "30px",
  backgroundColor: "#e8edf2",
  borderRadius: "8px",
  overflow: "hidden",
  width: "fit-content",
};

const tabStyle: React.CSSProperties = {
  padding: "10px 22px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "14px",
  color: "#4a5568",
  transition: "all 0.2s ease",
};

const activeTabStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#1f2937",
  fontWeight: 600,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

const tableWrapperStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  padding: "20px",
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const tableHeaderRow: React.CSSProperties = {
  backgroundColor: "#f1f5f9",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#334155",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "14px",
  color: "#475569",
};

const tableRowStyle: React.CSSProperties = {
  transition: "background 0.2s ease",
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "40px",
  color: "#94a3b8",
  fontSize: "15px",
};

export const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

export const modalCardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "25px",
  borderRadius: "12px",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  textAlign: "center",
};

export const statusBadgeStyle = (status: "pending" | "in_progress" | "completed"): React.CSSProperties => {
  let bgColor = "#fef3c7"; // default pending
  let textColor = "#b45309";

  if (status === "in_progress") {
    bgColor = "#bfdbfe";
    textColor = "#1d4ed8";
  } else if (status === "completed") {
    bgColor = "#dcfce7";
    textColor = "#166534";
  }

  return {
    backgroundColor: bgColor,
    color: textColor,
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 500,
    display: "inline-block",
  };
};

export const statusCardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  padding: "20px",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "default",
};

export const statusCardHoverStyle: React.CSSProperties = {
  transform: "translateY(-4px)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};

export default App;