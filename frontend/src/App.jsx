import React from "react";

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Appointment Scheduler
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Backend connection ready. Let's start booking.
        </p>

        <div className="mt-6">
          <button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition duration-200">
            View Available Slots
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
