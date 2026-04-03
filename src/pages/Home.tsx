// @ts-nocheck
import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "../utils/toastMessage";
import ContentWrapper from "../components/shared/ContentWrapper";
import Header from "../components/shared/Header";
import PunchButton from "../components/PunchButton";
import { useGeofence } from "../hooks/useGeoFence";
import { useAttendanceActions } from "../hooks/useAttendanceActions";
import EmployeeHeader from "../components/EmployeeHeader";
import StatusSection from "../components/StatusSection";
import MessageBanner from "../components/MessageBanner";
import AttendanceMainContent from "../components/AttendanceMainContent";
import { getFromFirebase } from "../api/firebaseAPI";
import { auth } from "../firebase/config";
import Announcements from "../components/Announcements";
import WorkTimeDisplay from "../components/WorkTimeDisplay";
import { useLocationPermission } from "../hooks/useLocationPermission";
import ColorLegend from "../components/ColorLegend";

export default function Home() {
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [workTimeDuration, setWorkTimeDuration] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDayCompleted, setIsDayCompleted] = useState(false);

  const { isInside } = useGeofence(setMessage);
  const { handleCheckIn, handleCheckOut } =
    useAttendanceActions(setIsCheckedIn);
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const { locationAllowed, permissionState, retryLocationCheck } =
    useLocationPermission();

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!uid) return;
      try {
        const details = await getFromFirebase(
          `/teammembers/${uid}/userDetails`,
        );
        const employeeRecord = details ? Object.values(details)[0] : null;
        if (employeeRecord?.username) setEmployeeName(employeeRecord.username);
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };
    fetchEmployeeDetails();
  }, [uid]);

  useEffect(() => {
    const restoreCheckInStatus = async () => {
      if (!uid) return;
      const todayKey = new Date().toLocaleDateString("en-CA");

      try {
        const record = await getFromFirebase(
          `/teammembers/${uid}/attendance/${todayKey}`,
        );
        if (!record) return;

        const data = Object.values(record)[0] || record;
        if (data.checkIn && !data.checkOut) {
          setIsCheckedIn(true);
        } else {
          setIsCheckedIn(false);
        }
      } catch (err) {
        console.error("Error restoring check-in status:", err);
      }
    };

    restoreCheckInStatus();
  }, [uid]);

  const status = isCheckedIn ? "Checked In" : "Not Checked In";
  const statusColor = isCheckedIn
    ? "var(--color-secondary)"
    : "var(--color-absent)";

  const recordPunch = async (todayStatus, setIsLoading, fetchTodayStatus) => {
    if (locationAllowed === null) {
      showErrorToast("Checking location — please wait a moment.");
      retryLocationCheck();
      return;
    }

    if (!locationAllowed) {
      if (permissionState === "denied") {
        showErrorToast(
          "Location permission denied. Enable site location in your browser settings.",
        );
      } else {
        showErrorToast("Please turn on device location services.");
      }
      retryLocationCheck();
      return;
    }
    if (!isInside) {
      showErrorToast("You are outside the office area.");
      return;
    }
    setIsLoading(true);
    try {
      if (todayStatus === "Check-in") {
        await handleCheckIn();
      } else if (todayStatus === "Check-out") {
        await handleCheckOut();
      }
      fetchTodayStatus?.();
    } catch (err) {
      console.error("Punch failed:", err);
      showErrorToast("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentWrapper>
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-6 mb-24">
        <motion.div
          className="flex flex-col justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EmployeeHeader employeeName={employeeName} />

          <div className="flex justify-between items-center max-h-fit">
            {isDayCompleted ? (
              <WorkTimeDisplay workDuration={workTimeDuration} />
            ) : (
              <StatusSection
                status={status}
                statusColor={statusColor}
                isInside={isInside}
              />
            )}
            <PunchButton
              recordPunch={recordPunch}
              onDayComplete={setIsDayCompleted}
              workDuration={setWorkTimeDuration}
            />
          </div>

          {message && !isDayCompleted && <MessageBanner message={message} />}
        </motion.div>

        <AttendanceMainContent />
        <ColorLegend />
        <Announcements />
      </div>
    </ContentWrapper>
  );
}
