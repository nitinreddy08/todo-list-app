import { Trash2, CheckCircle, Circle, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", description: "" });
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchTasks();
    const handleEscape = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setNewTask({ name: "", description: "" });
    setModalError(null);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/tasks");
      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please check if the server is running at http://127.0.0.1:5000/api/tasks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done"; 

    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task. Status: ${response.status}`);
      }

      const updatedTask = await response.json();
      console.log("Task updated:", updatedTask);
    } catch (err) {
      console.error("Error updating task:", err);
      fetchTasks();
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task. Status: ${response.status}`);
      }

      console.log(`Task with ID ${taskId} deleted successfully`);
    } catch (err) {
      console.error("Error deleting task:", err);
      fetchTasks();
    }
  };

  const addTask = async () => {
    if (!newTask.name.trim() || newTask.description.trim().length < 10) {
      setModalError("Description must be at least 10 characters long");
      return;
    }

    try {
      setModalError(null);
      const response = await fetch("http://127.0.0.1:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTask.name,
          description: newTask.description,
          status: "pending",
        }),
      });

      if (response.ok) {
        closeModal();
        await fetchTasks(); 
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server responded with ${response.status}`);
      }
    } catch (err) {
      console.error("Error adding task:", err);
      setModalError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please check if the server is running at http://127.0.0.1:5000/api/tasks"
          : `Error adding task: ${err.message}`
      );
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex justify-between flex-wrap">
            <div className="m-2.5 flex flex-col sm:flex-row gap-2">
              <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
              <p className="text-gray-600 text-sm sm:text-base">Organize your day efficiently</p>
            </div>
            <div>
              <button
                className="bg-blue-500 text-white p-2 rounded-lg m-2.5 hover:bg-blue-600 transition"
                onClick={() => setShowModal(true)}
              >
                + Add Task
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">All Tasks</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Your task list is empty.</p>
              <p className="text-sm mt-2">Add your first task to get started!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="mt-1 flex-shrink-0 focus:outline-none"
                    >
                      {task.status === "done" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </button>

                    <div className="flex-grow min-w-0">
                      <h3
                        className={`font-medium ${task.status === "done" ? "text-gray-500 line-through" : "text-gray-800"}`}
                      >
                        {task.name}
                      </h3>
                      {task.description && (
                        <p
                          className={`text-sm mt-1 ${
                            task.status === "done" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white border rounded-lg shadow-lg w-full sm:w-96 max-w-full">
            <div className="p-6 pb-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create Task</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-0">
              <div className="grid gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium">Task Name</label>
                  <input
                    id="name"
                    value={newTask.name}
                    onChange={handleInputChange}
                    placeholder="Name of your Task"
                    className="h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <input
                    id="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    placeholder="Enter Description (min 10 characters)"
                    className="h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {modalError && (
                  <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                    {modalError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-6 pt-0">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border bg-white px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addTask}
                disabled={!newTask.name.trim()}
                className={`rounded-md px-4 py-2 text-sm text-white shadow ${
                  newTask.name.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 cursor-not-allowed"
                }`}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Copyright */}
      <footer className="text-center py-4 text-sm text-gray-600">
        <p>© 2025 Developed by Nitin Reddy. All rights reserved.</p>
      </footer>
    </div>
  );
}
