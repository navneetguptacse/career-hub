"use client";

import React from "react";
import { PwaGuideModal } from "./PwaGuideModal";

interface PwaIosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaIosModal: React.FC<PwaIosModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <PwaGuideModal
      isOpen={isOpen}
      onClose={onClose}
      platform={{ isIos: true, isAndroid: false, isInAppBrowser: false }}
    />
  );
};
