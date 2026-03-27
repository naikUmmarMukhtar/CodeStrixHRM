export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const API_BASE_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

export const OFFICE_COORDS = { lat: 33.999889, lng: 74.792602 };
export const OFFICE_RADIUS_METERS = 40;
export const CHECKIN_START = { hour: 8, minute: 45 };
export const CHECKIN_END = { hour: 9, minute: 15 };
export const CHECKOUT_MIN = { hour: 17, minute: 0 };
export const CHECKOUT_MAX = { hour: 18, minute: 0 };
export const EMP_CODE = "EMP010925";
export const ADMIN_CODE = "CS050525";

export const FIXED_HOLIDAYS = [
  "2026-01-26",
  "2026-03-17",
  "2026-03-21",
  "2026-03-22",
  "2026-05-27", // Eid-ul-Adha / Bakrid (Day 1)
  "2026-05-28", // Eid-ul-Adha / Bakrid (Day 2)
  "2026-05-29", // Eid-ul-Adha / Bakrid (Day 3)
  "2026-06-26", // Ashura (Muharram)
  "2026-08-15", // Independence Day
  "2026-10-02", // Gandhi Jayanti
  "2026-12-25", // Christmas
];

export const WEEKEND_DAYS = [0, 6];
