import ApiIntegrationTest from "@/components/testing/api-integration-test"

export default function TestingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Integration Testing</h1>
        <p className="text-gray-600">
          Use this page to test all API integrations and verify functionality across the application.
        </p>
      </div>
      <ApiIntegrationTest />
    </div>
  )
}
