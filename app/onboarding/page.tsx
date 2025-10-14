"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

type DocItem = { url: string }

function DocsCollector({
  docs,
  setDocs,
  placeholder = "https://example.com/document.pdf",
}: {
  docs: DocItem[]
  setDocs: (v: DocItem[]) => void
  placeholder?: string
}) {
  const add = () => setDocs([...docs, { url: "" }])
  const rem = (i: number) => setDocs(docs.filter((_, idx) => idx !== i))
  const upd = (i: number, val: string) => setDocs(docs.map((d, idx) => (idx === i ? { url: val } : d)))
  return (
    <div className="space-y-2">
      {docs.map((d, i) => (
        <div key={i} className="flex gap-2">
          <Input value={d.url} onChange={(e) => upd(i, e.target.value)} placeholder={placeholder} className="flex-1" />
          <Button variant="outline" type="button" onClick={() => rem(i)}>
            Remove
          </Button>
        </div>
      ))}
      <Button variant="secondary" type="button" onClick={add}>
        Add Document URL
      </Button>
    </div>
  )
}

function SimpleOnboardingForm({
  title,
  hint,
}: {
  title: string
  hint: string
}) {
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [docs, setDocs] = useState<DocItem[]>([{ url: "" }])
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const docUrls = docs.map((d) => d.url).filter(Boolean)
    if (!userId || docUrls.length === 0) {
      toast({
        title: "Missing info",
        description: "Please provide userId and at least one document URL.",
        variant: "destructive",
      })
      return
    }
    try {
      setSubmitting(true)
      const res = await apiClient.createOnboarding({ userId, doc: docUrls })
      if ((res as any)?.data || (res as any)?.success) {
        toast({ title: "Submitted", description: "Onboarding record created. Admin will review." })
        setUserId("")
        setDocs([{ url: "" }])
      } else {
        toast({ title: "Submission failed", description: (res as any)?.error || "Try again.", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to submit onboarding.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="7cc3...bca3" />
            <p className="text-xs text-muted-foreground">
              Enter the existing account userId for this {title.toLowerCase()}.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Document URLs</Label>
            <DocsCollector docs={docs} setDocs={setDocs} />
            <p className="text-xs text-muted-foreground">
              Paste links to KYC or verification docs. You can add multiple.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Onboarding"}
            </Button>
            <Badge variant="secondary">Docs only</Badge>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function PublicOnboardingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Start New Onboarding</h1>
          <p className="text-muted-foreground">
            Submit documentation for Operator, Vendor, or Staff accounts. Admins will verify and approve.
          </p>
        </div>
        <Tabs defaultValue="operator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operator">Operator</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          <TabsContent value="operator">
            <SimpleOnboardingForm
              title="Operator Onboarding"
              hint="Provide userId of the operator account and upload document links for KYC and verification."
            />
          </TabsContent>
          <TabsContent value="vendor">
            <SimpleOnboardingForm
              title="Vendor Onboarding"
              hint="Provide userId of the vendor account and upload document links for KYC and verification."
            />
          </TabsContent>
          <TabsContent value="staff">
            <SimpleOnboardingForm
              title="Staff Onboarding"
              hint="Provide userId of the staff account and upload document links for verification. Staff may have different roles."
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
