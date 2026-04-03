import { Megaphone } from "lucide-react";

export default function Announcements() {
  const announcements = [
    {
      date: "Check-In",
      text: "Come in between 8:45 AM and 9:15 AM. Coming after 9:15 AM is late — a message will be sent to Teams and your salary may be cut.",
      color: "var(--color-primary)",
    },
    {
      date: "Check-Out",
      text: "Do not leave before 5:00 PM. You must check out by 6:00 PM.",
      color: "var(--color-secondary)",
    },
    {
      date: "Punctuality",
      text: "Coming late again and again will cause problems. It will also affect your salary.",
      color: "var(--color-accent)",
    },
    {
      date: "ID Cards",
      text: "Always wear your ID card in the office. You may not be allowed in without it.",
      color: "var(--color-primary)",
    },
    {
      date: "Discipline",
      text: "Behave properly, dress well, and be respectful at work. Bad conduct will not be ignored.",
      color: "var(--color-secondary)",
    },
    {
      date: "Attendance Report",
      text: "Your attendance will be sent to HR on 1st of every month. It starts from 1st April. Keep your attendance correct.",
      color: "var(--color-accent)",
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