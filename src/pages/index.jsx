import { Trash2, CheckCircle, Circle, Loader2, X, Plus, Calendar, Clock, AlertCircle, Menu, Search, Filter, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", description: "" });
  const [modalError, setModalError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, done
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const searchInputRef = useRef(null);
  const newTaskNameRef = useRef(null);

  useEffect(() => {
    fetchTasks();
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        setShowMobileSearch(false);
        setShowConfirmModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  useEffect(() => {
    if (showModal && newTaskNameRef.current) {
      setTimeout(() => {
        newTaskNameRef.current.focus();
      }, 100);
    }
  }, [showModal]);

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

    // Optimistic update
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
      fetchTasks(); // Revert to server state if failed
    }
  };

  const openDeleteConfirmation = (taskId) => {
    setTaskToDelete(taskId);
    setShowConfirmModal(true);
  };

  const deleteTask = async (taskId) => {
    setShowConfirmModal(false);
    
    // Optimistic update
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
      fetchTasks(); // Revert to server state if failed
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

  const toggleFilter = (filterValue) => {
    setFilter(filterValue);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Mobile-friendly fixed header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-blue-800">My Tasks</h1>
            
            <div className="flex items-center space-x-2">
              {/* Mobile search toggle */}
              <button 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors md:hidden"
                aria-label="Search tasks"
              >
                <Search size={20} />
              </button>
              
              {/* Mobile filter toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors md:hidden relative"
                aria-label="Filter tasks"
              >
                <Filter size={20} />
                {filter !== "all" && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              
              {/* Add task button */}
              <button
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md flex items-center gap-1 text-sm md:text-base md:px-4"
                onClick={() => setShowModal(true)}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>
          
          {/* Mobile search bar */}
          {showMobileSearch && (
            <div className="px-4 py-2 bg-gray-50 border-t border-b border-gray-200 md:hidden">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border rounded-md text-sm bg-white"
                />
                {searchTerm ? (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <Search size={16} className="absolute right-2 top-2.5 text-gray-400" />
                )}
              </div>
            </div>
          )}
          
          {/* Mobile filters */}
          {showFilters && (
            <div className="px-4 py-3 bg-gray-50 border-t border-b border-gray-200 md:hidden">
              <div className="flex justify-between">
                <button
                  onClick={() => toggleFilter("all")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    filter === "all" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-white text-gray-700 border"
                  }`}
                >
                  All
                </button>
                <div className="w-2"></div>
                <button
                  onClick={() => toggleFilter("pending")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    filter === "pending" 
                      ? "bg-yellow-100 text-yellow-700" 
                      : "bg-white text-gray-700 border"
                  }`}
                >
                  Pending
                </button>
                <div className="w-2"></div>
                <button
                  onClick={() => toggleFilter("done")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    filter === "done" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-white text-gray-700 border"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        {/* Task summary cards - desktop view */}
        <div className="hidden sm:grid grid-cols-3 gap-4 my-6">
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

        {/* Task summary cards - mobile view (horizontal scroll) */}
        <div className="flex overflow-x-auto gap-3 py-2 my-2 sm:hidden px-1">
          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500 flex-shrink-0 w-40">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <Calendar size={16} className="text-blue-500" />
            </div>
            <p className="text-xl font-bold text-gray-800 mt-1">{total}</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-yellow-500 flex-shrink-0 w-40">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <Clock size={16} className="text-yellow-500" />
            </div>
            <p className="text-xl font-bold text-gray-800 mt-1">{pending}</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500 flex-shrink-0 w-40">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-800 mt-1">{completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <h2 className="text-xl font-medium text-gray-800">
                {filter === "all" ? "All Tasks" : filter === "pending" ? "Pending Tasks" : "Completed Tasks"}
              </h2>
              
              {/* Desktop search and filters */}
              <div className="hidden md:flex gap-4">
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
            <div className="flex flex-col items-center justify-center py-12">
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
            <div className="p-8 sm:p-12 text-center text-gray-500">
              {tasks.length === 0 ? (
                <>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
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
                  {(searchTerm || filter !== "all") && (
                    <button
                      className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchTerm("");
                        setFilter("all");
                        setShowFilters(false);
                      }}
                    >
                      <X size={16} />
                      Clear Filters
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`px-4 py-3 sm:p-4 hover:bg-blue-50 transition-all ${
                    task.status === "done" ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="mt-1 flex-shrink-0 focus:outline-none transition-transform hover:scale-110"
                      aria-label={task.status === "done" ? "Mark as pending" : "Mark as done"}
                    >
                      {task.status === "done" ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="flex-grow min-w-0">
                      <h3
                        className={`font-medium ${
                          task.status === "done" 
                            ? "text-gray-500 line-through" 
                            : "text-gray-800"
                        } transition-all text-sm sm:text-base`}
                      >
                        {task.name}
                      </h3>
                      {task.description && (
                        <p
                          className={`text-xs sm:text-sm mt-1 ${
                            task.status === "done" ? "text-gray-400" : "text-gray-600"
                          } transition-all line-clamp-2 sm:line-clamp-none`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => openDeleteConfirmation(task.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 focus:outline-none transition-colors rounded-full hover:bg-red-50"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom action bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center md:hidden">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 w-full max-w-xs"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          <span className="font-medium">Add New Task</span>
        </button>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white border rounded-lg shadow-xl w-full sm:w-96 max-w-full transform transition-all">
            <div className="p-4 sm:p-6 pb-3 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
              <button 
                onClick={closeModal} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 pt-4">
              <div className="grid gap-5">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Task Name</label>
                  <input
                    id="name"
                    ref={newTaskNameRef}
                    value={newTask.name}
                    onChange={handleInputChange}
                    placeholder="What needs to be done?"
                    className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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
                  <div className={`text-xs flex justify-end ${
                    newTask.description.length < 10 ? "text-red-500" : "text-gray-500"
                  }`}>
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

            <div className="flex items-center justify-end gap-2 p-4 sm:p-6 pt-2 border-t">
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

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Task</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTask(taskToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Copyright */}
      <footer className="text-center py-4 text-xs sm:text-sm text-gray-500 mt-8 pb-20 sm:pb-8">
        <p>© 2025 Developed by Nitin Reddy. All rights reserved.</p>
      </footer>
    </div>
  );
}