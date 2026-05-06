import { Pencil, Archive } from "lucide-react";

export default function ScheduleTabPrototype() {
  const employees = [
    {
      department: "Standard",
      shifts: 4,
      schedule: [
        ["AM IN", "04:00 → 10:00", "AM"],
        ["AM OUT", "12:00 → 12:30", "AM"],
        ["PM IN", "12:31 → 13:00", "PM"],
        ["PM OUT", "14:00 → 23:59", "PM"],
      ],
    },
    {
      department: "CM_COOK",
      shifts: 2,
      schedule: [
        ["AM IN", "01:00 → 08:00", "AM"],
        ["AM OUT", "08:01 → 12:30", "AM"],
      ],
    },
  ];

  const badgeStyle = {
    AM: "bg-blue-100 text-blue-700",
    PM: "bg-green-100 text-green-700",
    OT: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-auto">
      <div className="p-1 md:p-5 md:mt-0">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Schedule
          </h1>

          <button className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow">
            Add Schedule
          </button>
        </div>

        {/* LIST */}
        <div className="grid gap-4">
          {employees.map((employee, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border shadow-sm p-5"
            >
              <div className="grid grid-cols-12 gap-4 items-start">

                {/* Department */}
                <div className="col-span-3">
                  <h2 className="font-bold text-slate-800 text-lg">
                    {employee.department}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {employee.shifts} shifts
                  </p>
                </div>

                {/* Schedule */}
                <div className="col-span-7 space-y-2">
                  {employee.schedule.map((shift, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3"
                    >
                      <div className="font-medium text-slate-700">
                        {shift[0]}
                      </div>

                      <div className="font-mono text-sm text-slate-700">
                        {shift[1]}
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          badgeStyle[shift[2]]
                        }`}
                      >
                        {shift[2]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button className="text-blue-600 hover:text-blue-800 transition">
                    <Pencil size={18} />
                  </button>

                  <button className="p-2 rounded-md hover:bg-gray-200 text-red-500">
                    <Archive size={18} />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}