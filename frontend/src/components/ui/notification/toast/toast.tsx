"use client";

import { toast, ToasterProps } from "sonner";
import React from "react";

export type ToastPosition = ToasterProps["position"];

export interface ShowToastOptions {
  title: string;
  description?: string;
  position?: ToastPosition;
  type?: "default" | "success" | "info" | "warning" | "error";
  duration?: number;
}

/**
 * Custom helper to show Sonner toast notifications with title, description, and position params.
 */
export function showNotification({
  title,
  description,
  position = "bottom-right",
  type = "default",
  duration = 4000,
}: ShowToastOptions) {
  const toastOptions = {
    description,
    position,
    duration,
  };

  switch (type) {
    case "success":
      return toast.success(title, toastOptions);
    case "error":
      return toast.error(title, toastOptions);
    case "info":
      return toast.info(title, toastOptions);
    case "warning":
      return toast.warning(title, toastOptions);
    default:
      return toast(title, toastOptions);
  }
}

export { toast };
