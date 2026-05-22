"use client";

import { useState } from "react";
import { TaxiCalculator } from "@/app/components/TaxiCalculator";
import { EmailCaptureModal } from "@/app/components/EmailCaptureModal";
import type { TaxiRoute } from "@/data/taxiData";

type Ciudad = TaxiRoute["ciudad"];

export default function TaxiPage() {
  const [ciudad, setCiudad] = useState<Ciudad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <TaxiCalculator
        ciudad={ciudad}
        setCiudad={setCiudad}
        onCapture={() => setIsModalOpen(true)}
      />
      <EmailCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ciudad={ciudad}
        onSuccess={() => setIsModalOpen(false)}
      />
    </main>
  );
}
