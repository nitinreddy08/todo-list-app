import { useState } from "react";

export default function CardWithForm({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("https://nitinreddy118.pythonanywhere.com//api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      onAdd(); // Refresh the task list
      onClose(); // Close the modal
      setFormData({ name: "", description: "" }); // Reset form
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border rounded-lg shadow-sm w-96 max-w-full">
        {/* Card Header */}
        <div className="p-6 pb-3">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Create Task
          </h3>
        </div>

        {/* Card Content */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {/* Name Input */}
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none"
                >
                  Task Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name of your Task"
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="description"
                  className="text-sm font-medium leading-none"
                >
                  Description
                </label>
                <input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter Description (more than 10 chars)"
                  required
                  minLength={10}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between p-6 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
