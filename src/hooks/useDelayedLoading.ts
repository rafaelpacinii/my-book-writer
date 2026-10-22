"use client";

import { useEffect, useState } from "react";

export function useDelayedLoading(isLoading: boolean, delay = 150) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => {
      clearTimeout(timer);
      setVisible(false);
    };
  }, [isLoading, delay]);
  return isLoading && visible;
}
