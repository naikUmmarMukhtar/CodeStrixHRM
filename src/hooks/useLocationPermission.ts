import { useCallback, useEffect, useRef, useState } from "react";

type PermissionStateType = "granted" | "prompt" | "denied" | "unsupported";

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const getCurrentPositionAsync = (options?: PositionOptions) =>
  new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options),
  );

export const useLocationPermission = () => {
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionStateType>("unsupported");
  const lastCheckRef = useRef<number>(0);
  const retryRef = useRef(0);

  const throttle = (ms = 1000) => {
    const now = Date.now();
    if (now - lastCheckRef.current < ms) return false;
    lastCheckRef.current = now;
    return true;
  };

  const evaluateWithGetPosition = useCallback(
    async (promptIfNeeded = false) => {
      if (!navigator.geolocation) {
        setLocationAllowed(false);
        setPermissionState("unsupported");
        return false;
      }

      try {
        // try to get a quick position. This will prompt if permission is "prompt".
        await getCurrentPositionAsync({
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 0,
        });
        setLocationAllowed(true);
        setPermissionState("granted");
        retryRef.current = 0;
        return true;
      } catch (err: any) {
        // err.code === 1 => PERMISSION_DENIED
        // err.code === 2 => POSITION_UNAVAILABLE
        // err.code === 3 => TIMEOUT
        if (err?.code === 1) {
          setLocationAllowed(false);
          setPermissionState("denied");
        } else {
          // POSITION_UNAVAILABLE or TIMEOUT -> probably system or GPS off or poor signal
          // For Safari we can retry a few times (sometimes iOS needs retries).
          if (isSafari && retryRef.current < 3) {
            retryRef.current++;
            await new Promise((r) => setTimeout(r, 1000));
            return evaluateWithGetPosition(promptIfNeeded);
          }
          setLocationAllowed(false);
          setPermissionState("prompt"); // treat as prompt/unavailable
        }
        return false;
      }
    },
    [],
  );

  const checkPermission = useCallback(async () => {
    if (!throttle()) return locationAllowed ?? false;

    if (!navigator.geolocation) {
      setLocationAllowed(false);
      setPermissionState("unsupported");
      return false;
    }

    if (navigator.permissions && (navigator.permissions as any).query) {
      try {
        const p = await (navigator.permissions as any).query({
          name: "geolocation",
        });
        // p.state is "granted" | "prompt" | "denied"
        setPermissionState(p.state);
        if (p.state === "granted") {
          setLocationAllowed(true);
          retryRef.current = 0;
          return true;
        } else if (p.state === "prompt") {
          // don't assume true; try to get a position (may prompt)
          return evaluateWithGetPosition(true);
        } else {
          // denied
          setLocationAllowed(false);
          return false;
        }
      } catch (e) {
        // Permissions API failed - fallback to attempting getCurrentPosition
        return evaluateWithGetPosition();
      }
    } else {
      // Permissions API unsupported (older Safari) -> attempt getCurrentPosition
      return evaluateWithGetPosition();
    }
  }, [evaluateWithGetPosition, locationAllowed]);

  const requestLocation = useCallback(async () => {
    // explicit user-triggered request: try to prompt/get position
    retryRef.current = 0;
    return checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      try {
        await checkPermission();
      } catch {
        if (!mounted) return;
        setLocationAllowed(false);
      }
    };
    run();

    // periodic re-check (short interval for Safari issues, otherwise moderate)
    const interval = setInterval(run, isSafari ? 5000 : 6000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [checkPermission]);

  return {
    locationAllowed,
    permissionState,
    retryLocationCheck: requestLocation,
  };
};

export default useLocationPermission;
