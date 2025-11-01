import { useEffect, useState } from "react";

const getOfflineStatus = () =>
  typeof navigator !== "undefined" ? !navigator.onLine : false;

const useOfflineStatus = (): boolean => {
  const [isOffline, setIsOffline] = useState<boolean>(() => getOfflineStatus());

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOffline(getOfflineStatus());
    };

    handleStatusChange();
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  return isOffline;
};

export default useOfflineStatus;
