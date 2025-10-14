import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmationToastProps {
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  className?: string
}

export function ConfirmationToast({ type, title, message, className }: ConfirmationToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: "text-green-600 bg-green-50 border-green-200",
    error: "text-red-600 bg-red-50 border-red-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    info: "text-blue-600 bg-blue-50 border-blue-200",
  }

  const Icon = icons[type]

  return (
    <div className={cn("flex items-start space-x-3 p-4 border rounded-lg", colors[type], className)}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
      </div>
    </div>
  )
}
