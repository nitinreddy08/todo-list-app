export default function CardWithForm() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white border rounded-lg shadow-sm w-96 max-w-full">
        {/* Card Header */}
        <div className="p-6 pb-3">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Create Task
          </h3>
        </div>

        {/* Card Content */}
        <div className="p-6 pt-0">
          <form>
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
                  placeholder="Name of your Task"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none"
                >
                  Description
                </label>
                <input
                  id="name"
                  placeholder="Enter Description (more than 10 chars)"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between p-6 pt-0">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
