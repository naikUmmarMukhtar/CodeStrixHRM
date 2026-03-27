const holidayList = [
  { name: "Republic Day", date: "2026-01-26", day: "Monday" },
  { name: "Shab-e-Qadr", date: "2026-03-17", day: "Tuesday" },
  { name: "Eid-ul-Fitr", date: "2026-03-21", day: "Saturday" },
  { name: "Eid-ul-Fitr (Day 2)", date: "2026-03-22", day: "Sunday" },
  { name: "Eid-ul-Adha / Bakrid", date: "2026-05-27", day: "Wednesday" },
  { name: "Eid-ul-Adha / Bakrid (Day 2)", date: "2026-05-28", day: "Thursday" },
  { name: "Eid-ul-Adha / Bakrid (Day 3)", date: "2026-05-29", day: "Friday" },
  { name: "Ashura (Muharram)", date: "2026-06-26", day: "Friday" },
  { name: "Independence Day", date: "2026-08-15", day: "Saturday" },
  { name: "Gandhi Jayanti", date: "2026-10-02", day: "Friday" },
  { name: "Christmas", date: "2026-12-25", day: "Friday" },
];

export default function HolidayList() {
  return (
    <div className="min-h-screen bg-(--color-bg-alt) flex justify-center mb-16">
      <div className="w-full max-w-2xl bg-(--color-bg) rounded-2xl shadow-md py-6 border border-(--color-border)">
        <h1 className="text-2xl font-semibold text-center mb-6 text-(--color-primary)">
          📅 Holiday List - 2026
        </h1>

        <div className="divide-y divide-(--color-border)">
          {holidayList.map((holiday, index) => (
            <div
              key={holiday.date}
              className="flex justify-between items-center py-3 px-4 rounded-lg my-1 hover:bg-(--color-holiday-bg) transition"
            >
              <div>
                <p className="text-(--color-text) font-medium">
                  {index + 1}. {holiday.name}
                </p>
                <p className="text-sm text-(--color-text-muted)">
                  {holiday.day}
                </p>
              </div>
              <div className="text-(--color-holiday) font-semibold">
                {new Date(holiday.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
