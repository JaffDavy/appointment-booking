// src/App.tsx
import React, { useState } from "react";
import type { TimeSlot } from "./types";

function App() {
  // Safe array initialization mapped directly to our strict type blueprint
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      // Axios will map straight through our server proxy to avoid CORS
      // const response = await axios.get<TimeSlot[]>('/api/slots');
      // setSlots(response.data);

      // Temporary mock data for UI testing:
      setSlots([
        { id: "1", dateTime: "2026-06-25T09:00:00", isAvailable: true },
        { id: "2", dateTime: "2026-06-25T10:30:00", isAvailable: false },
      ]);
    } catch (error) {
      console.error("Error fetching timeslots:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Appointment Scheduler
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          TypeScript context & Tailwind v4 active.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={fetchSlots}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition duration-200"
          >
            {loading ? "Loading Slots..." : "Check Available Slots"}
          </button>

          {slots.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex justify-between p-3 rounded-lg border text-sm ${
                    slot.isAvailable
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-slate-100 border-slate-200 text-slate-400 line-through"
                  }`}
                >
                  <span>
                    {new Date(slot.dateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-medium">
                    {slot.isAvailable ? "Available" : "Booked"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
