// @ts-nocheck
import { getAuth } from "firebase/auth";
import {
  CHECKIN_END,
  CHECKIN_START,
  CHECKOUT_MAX,
  CHECKOUT_MIN,
} from "../lib/constants";
import {
  getFromFirebase,
  postToFirebase,
  putToFirebase,
} from "../api/firebaseAPI";
import { showErrorToast, showSuccessToast } from "../utils/toastMessage";
import { checkTimeWarnings } from "../utils/timeValidation";
import { confirmAction } from "../utils/ConfirmDialog";

const calculateWorkDuration = (checkIn, checkOut) => {
  try {
    const inTime = new Date(`1970-01-01T${convertTo24Hr(checkIn)}Z`);
    const outTime = new Date(`1970-01-01T${convertTo24Hr(checkOut)}Z`);
    const diff = (outTime - inTime) / 1000;
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
};

const convertTo24Hr = (timeStr) => {
  if (!timeStr) return "00:00:00";
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes, seconds] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
};

const formatWorkTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export function useAttendanceActions(setIsCheckedIn) {
  const user = getAuth().currentUser;
  const userId = user?.uid;

  const getTodayKey = () => new Date().toLocaleDateString("en-CA");
  const getTimeNow = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const handleCheckIn = async () => {
    const now = new Date();
    const today = getTodayKey();
    const timeOnly = getTimeNow();

    try {
      if (
        now.getHours() < CHECKIN_START.hour ||
        (now.getHours() === CHECKIN_START.hour &&
          now.getMinutes() < CHECKIN_START.minute)
      ) {
        showErrorToast("Check-in not allowed before 8:45 AM.");
        return;
      }
      if (
        now.getHours() > CHECKIN_END.hour ||
        (now.getHours() === CHECKIN_END.hour &&
          now.getMinutes() > CHECKIN_END.minute)
      ) {
        const confirmLate = await confirmAction(
          `It's after 9:15 AM. This will be recorded as a late check-in. Do you still want to proceed?`,
        );
        if (!confirmLate) return;
      }

      await postToFirebase(`/teammembers/${userId}/attendance/${today}`, {
        checkIn: timeOnly,
        checkOut: "",
        workDuration: "",
        status: "absent",
      });
      setIsCheckedIn(true);
      // setPunches((prev) => [...prev, { time: timeOnly, type: "Check-in" }]);
      showSuccessToast("Check-in successful!");
    } catch (err) {
      console.error("Firebase error:", err);
      showErrorToast("Failed to post attendance.");
    }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    const today = getTodayKey();
    const timeOnly = getTimeNow();

    try {
      if (now.getHours() < CHECKOUT_MIN.hour) {
        const confirmEarly = await confirmAction(
          `It's before 4:30 PM. Checking out early may affect your total work duration. Do you still want to proceed?`,
        );
        if (!confirmEarly) return;
      }
      if (
        now.getHours() > CHECKOUT_MAX.hour ||
        (now.getHours() === CHECKOUT_MAX.hour &&
          now.getMinutes() > CHECKOUT_MAX.minute)
      ) {
        showErrorToast(`Checkout is not allowed after 7:00 PM.`);
        return;
      }

      const existingData = await getFromFirebase(
        `/teammembers/${userId}/attendance/${today}`,
      );
      if (!existingData) {
        showErrorToast("No check-in found for today.");
        return;
      }

      const keys = Object.keys(existingData);
      const autoKey = keys.find((k) => k.startsWith("-"));
      const record = autoKey ? existingData[autoKey] : existingData;

      const checkInTime = record?.checkIn;
      if (!checkInTime) {
        showErrorToast("Check-in time not found.");
        return;
      }

      const totalSeconds = calculateWorkDuration(checkInTime, timeOnly);
      const formattedDuration = formatWorkTime(totalSeconds);

      await putToFirebase(`/teammembers/${userId}/attendance/${today}`, {
        checkIn: checkInTime,
        checkOut: timeOnly,
        workDuration: formattedDuration,
        status: "Present",
      });

      // setPunches((prev) => [...prev, { time: timeOnly, type: "Check-out" }]);
      setIsCheckedIn(false);

      showSuccessToast("Checked out successfully!");
    } catch (error) {
      console.error("Error during check-out:", error);
      showErrorToast(
        "Something went wrong during check-out. Please try again.",
      );
    } finally {
    }
  };

  return { handleCheckIn, handleCheckOut };
}
