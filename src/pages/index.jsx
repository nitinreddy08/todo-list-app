import { Trash2, CheckCircle, Circle, Loader2, X, Plus, Calendar, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", description: "" });
  const [modalError, setModalError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, done
  const [searchTerm, setSearchTerm] = useState("");

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
    // Ask for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
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

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (filter === "pending" && task.status !== "pending") return false;
    if (filter === "done" && task.status !== "done") return false;
    
    // Apply search
    if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getTasksCount = () => {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === "pending").length;
    const completed = tasks.filter(task => task.status === "done").length;
    return { total, pending, completed };
  };

  const { total, pending, completed } = getTasksCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex justify-between flex-wrap items-center">
            <div className="m-2.5 flex flex-col">
              <h1 className="text-4xl font-bold text-blue-800">My Tasks</h1>
              <p className="text-blue-600 mt-1">Organize your day efficiently</p>
            </div>
            <div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
                onClick={() => setShowModal(true)}
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>
          </div>
          
          {/* Task summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Tasks</span>
                <Calendar size={18} className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{total}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <Clock size={18} className="text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{pending}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <CheckCircle size={18} className="text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{completed}</p>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <h2 className="text-xl font-medium text-gray-800">All Tasks</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                {/* Filter buttons */}
                <div className="flex rounded-md shadow-sm text-sm">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-2 border ${
                      filter === "all" 
                        ? "bg-blue-50 text-blue-700 border-blue-300" 
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } rounded-l-md`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`px-3 py-2 border-t border-b border-r ${
                      filter === "pending" 
                        ? "bg-yellow-50 text-yellow-700 border-yellow-300" 
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter("done")}
                    className={`px-3 py-2 border-t border-b border-r ${
                      filter === "done" 
                        ? "bg-green-50 text-green-700 border-green-300" 
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } rounded-r-md`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading your tasks...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center p-4 mb-4 bg-red-50 text-red-500 rounded-lg">
                <AlertCircle className="w-6 h-6 mr-2" />
                <span>{error}</span>
              </div>
              <button 
                onClick={fetchTasks} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {tasks.length === 0 ? (
                <>
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">Your task list is empty</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    Add your first task to get started and boost your productivity!
                  </p>
                  <button
                    className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md flex items-center gap-2 mx-auto"
                    onClick={() => setShowModal(true)}
                  >
                    <Plus size={18} />
                    Add Your First Task
                  </button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">No matching tasks</p>
                  <p className="text-sm mt-2">Try adjusting your search or filter settings</p>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`p-4 hover:bg-blue-50 transition-all ${
                    task.status === "done" ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="mt-1 flex-shrink-0 focus:outline-none transition-transform hover:scale-110"
                      aria-label={task.status === "done" ? "Mark as pending" : "Mark as done"}
                    >
                      {task.status === "done" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="flex-grow min-w-0">
                      <h3
                        className={`font-medium ${
                          task.status === "done" 
                            ? "text-gray-500 line-through" 
                            : "text-gray-800"
                        } transition-all`}
                      >
                        {task.name}
                      </h3>
                      {task.description && (
                        <p
                          className={`text-sm mt-1 ${
                            task.status === "done" ? "text-gray-400" : "text-gray-600"
                          } transition-all`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 focus:outline-none transition-colors rounded-full hover:bg-red-50"
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white border rounded-lg shadow-xl w-full sm:w-96 max-w-full transform transition-all">
            <div className="p-6 pb-3 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
              <button 
                onClick={closeModal} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-4">
              <div className="grid gap-5">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Task Name</label>
                  <input
                    id="name"
                    value={newTask.name}
                    onChange={handleInputChange}
                    placeholder="What needs to be done?"
                    className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description <span className="text-xs text-gray-500">(min 10 characters)</span>
                  </label>
                  <textarea
                    id="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    placeholder="Add details about your task"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-24"
                  />
                  <div className="text-xs text-gray-500 flex justify-end">
                    {newTask.description.length}/10 characters
                  </div>
                </div>

                {modalError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 pt-2 border-t">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addTask}
                disabled={!newTask.name.trim() || newTask.description.trim().length < 10}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow transition-all ${
                  newTask.name.trim() && newTask.description.trim().length >= 10
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Copyright */}
      <footer className="text-center py-6 mt-12 text-sm text-gray-500">
        <p>© 2025 Developed by Nitin Reddy. All rights reserved.</p>
      </footer>
    </div>
  );
}