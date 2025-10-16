"use client"

import UploadDocs from "@/components/onboarding/upload-docs"

export default function TechnicianOnboardingPage() {
  return (
    <UploadDocs
      title="Technician Onboarding"
      description="Upload ID/address proofs and relevant compliance documents."
      presets={["id_proof", "address_proof", "police_verification", "qualification_certificate"]}
    />
  )
}
