"use client"

import UploadDocs from "@/components/onboarding/upload-docs"

export default function OperatorOnboardingPage() {
  return (
    <UploadDocs
      title="Operator Documents"
      description="Upload KYC and compliance docs (e.g., GST Certificate, Company PAN, Business License, Bank Statement)."
      presets={["company_pan", "gst_certificate", "business_license", "bank_statement", "id_proof", "address_proof"]}
    />
  )
}
