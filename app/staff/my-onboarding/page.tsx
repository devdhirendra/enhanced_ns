"use client"

import UploadDocs from "@/components/onboarding/upload-docs"

export default function StaffMyOnboardingPage() {
  return (
    <UploadDocs
      title="My Onboarding (Staff)"
      description="Upload qualification documents and resume for HR verification."
      presets={["metric_marksheet", "degree_certificate", "experience_letter", "id_proof", "resume_pdf"]}
    />
  )
}
