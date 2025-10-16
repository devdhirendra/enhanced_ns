"use client"

import UploadDocs from "@/components/onboarding/upload-docs"

export default function VendorOnboardingPage() {
  return (
    <UploadDocs
      title="Vendor Onboarding / KYC"
      description="Upload vendor KYC and business documents for verification."
      presets={["kyc_pan", "gst_certificate", "store_registration", "cancelled_cheque", "address_proof", "id_proof"]}
    />
  )
}
