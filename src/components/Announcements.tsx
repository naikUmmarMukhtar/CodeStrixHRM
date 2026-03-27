// @ts-nocheck
import { Megaphone } from "lucide-react";

export default function Announcements() {
  const announcements = [
    {
      date: "Check-In",
      text: "Official check-in window is 8:45 AM – 9:15 AM. Arrivals after 9:15 AM will be marked late and may result in salary deduction.",
      color: "var(--color-primary)",
    },
    {
      date: "Check-Out",
      text: "Early departures before 5:00 PM are not permitted. The checkout window closes at 6:00 PM.",
      color: "var(--color-secondary)",
    },
    {
      date: "Punctuality",
      text: "Repeated late arrivals will lead to disciplinary action. Be on time — consistent tardiness directly affects your salary.",
      color: "var(--color-accent)",
    },
    {
      date: "ID Cards",
      text: "All employees must wear their office ID cards at all times within the premises. Entry may be denied without a valid card.",
      color: "var(--color-primary)",
    },
    {
      date: "Discipline",
      text: "Maintain professional conduct, dress code, and workplace etiquette at all times. Violations will be taken seriously.",
      color: "var(--color-secondary)",
    },
  ];

  return (
    <section
      className="bg-(--color-bg) text-(--color-text)"
      aria-labelledby="announcements-title"
    >
      <h3
        id="announcements-title"
        className="font-bold text-lg pb-2 mb-3 flex items-center gap-2"
      >
        <Megaphone size={18} color="var(--color-accent)" />
        Announcements
      </h3>

      <ul className="space-y-2 text-sm">
        {announcements.map((item, index) => (
          <li
            key={index}
            className="border-l-4 rounded p-2"
            style={{ borderColor: item.color }}
          >
            <strong>{item.date}:</strong> {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
