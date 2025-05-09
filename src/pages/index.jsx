import {
  Trash2,
  CheckCircle,
  Circle,
  Loader2,
  X,
  Clock,
  Calendar,
  PlusCircle,
  Search,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    priority: "medium",
  });
  const [modalError, setModalError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

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
    setNewTask({ name: "", description: "", priority: "medium" });
    setModalError(null);
  };

  const fetchTasks = async (retries = 3, delay = 1000) => {
    setLoading(true);
    setError(null);

    const attemptFetch = async (attempt) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          "https://nitinreddy118.pythonanywhere.com/api/tasks",
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        setTasks(result);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(2, attempt))
          );
          return attemptFetch(attempt + 1);
        } else {
          console.error("Error fetching tasks:", err);
          setError(
            "Failed to load tasks. Please check your network or try again later."
          );
          setLoading(false);
        }
      }
    };

    attemptFetch(0);
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const response = await fetch(
        `https://nitinreddy118.pythonanywhere.com/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

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
      const response = await fetch(
        `https://nitinreddy118.pythonanywhere.com/api/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete task. Status: ${response.status}`);
      }

      console.log(`Task with ID ${taskId} deleted successfully`);
    } catch (err) {
      console.error("Error deleting task:", err);
      fetchTasks();
    }
  };

  const addTask = async (retries = 3, delay = 1000) => {
    if (!newTask.name.trim() || newTask.description.trim().length < 10) {
      setModalError("Description must be at least 10 characters long");
      return;
    }

    const attemptPost = async (attempt) => {
      try {
        setModalError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          "https://nitinreddy118.pythonanywhere.com/api/tasks",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newTask.name,
              description: newTask.description,
              status: "pending",
              priority: newTask.priority,
              createdAt: new Date().toISOString(),
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          closeModal();
          await fetchTasks();
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Server responded with ${response.status}`
          );
        }
      } catch (err) {
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(2, attempt))
          );
          return attemptPost(attempt + 1);
        } else {
          console.error("Error adding task:", err);
          setModalError(
            err.name === "AbortError"
              ? "Request timed out. Please try again."
              : "Failed to add task. Please check your network or try again."
          );
        }
      }
    };

    attemptPost(0);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const getFilteredTasks = () => {
    return tasks
      .filter(
        (task) =>
          task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((task) => {
        if (filter === "all") return true;
        if (filter === "done") return task.status === "done";
        if (filter === "pending") return task.status === "pending";
        return true;
      });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex justify-between items-center flex-wrap">
            <div className="m-2.5">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Task Dashboard
              </h1>
              <p className="text-gray-600">Organize your day efficiently</p>
            </div>
            <div>
              <button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg m-2.5 hover:from-blue-600 hover:to-indigo-700 transition flex items-center gap-2 shadow-md"
                onClick={() => setShowModal(true)}
              >
                <PlusCircle className="w-5 h-5" /> New Task
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-8 py-2 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">My Tasks</h2>
            <span className="text-sm text-gray-500">
              {tasks.length > 0
                ? `${filteredTasks.length} of ${tasks.length} tasks`
                : "No tasks"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <span className="ml-3 text-gray-600">Loading your tasks...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Connection Error
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchTasks()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              {tasks.length === 0 ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
                    <PlusCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Your task list is empty
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first task to get started!
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Task
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No matching tasks
                  </h3>
                  <p className="text-gray-600">
                    Try changing your search or filter settings
                  </p>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className={`p-4 hover:bg-gray-50 transition ${
                    task.status === "done" ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="mt-1 flex-shrink-0 focus:outline-none"
                    >
                      {task.status === "done" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-medium ${
                            task.status === "done"
                              ? "text-gray-500 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {task.name}
                        </h3>
                        {task.priority && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p
                          className={`text-sm ${
                            task.status === "done"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {task.createdAt && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            Created{" "}
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 focus:outline-none rounded-full hover:bg-gray-100"
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-30 backdrop-blur-lg p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn scale-95 sm:scale-100 transition-all duration-300">
            <div className="p-6 pb-3 flex justify-between items-center border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                Create New Task
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTask();
              }}
              className="p-6"
            >
              <div className="grid gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Task Name
                  </label>
                  <input
                    id="name"
                    value={newTask.name}
                    onChange={handleInputChange}
                    placeholder="What needs to be done?"
                    required
                    autoFocus
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    placeholder="Enter details about this task (min 10 characters)"
                    rows={3}
                    minLength={10}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                  />
                </div>
                
                {modalError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {modalError}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTask.name.trim()}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    newTask.name.trim()
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-400 cursor-not-allowed"
                  }`}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="text-center py-8 mt-8 text-sm text-gray-600">
        <p className="flex items-center justify-center gap-1">
          <span>© 2025 Developed by Nitin Reddy.</span>
          <span className="text-blue-600">All rights reserved.</span>
        </p>
      </footer>
    </div>
  );
}