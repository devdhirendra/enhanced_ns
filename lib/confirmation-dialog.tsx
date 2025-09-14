export interface ConfirmationOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export const showConfirmation = (options: ConfirmationOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    const {
      title = "Confirm Action",
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "default",
    } = options

    // Create modal overlay
    const overlay = document.createElement("div")
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"

    // Create modal content
    const modal = document.createElement("div")
    modal.className = "bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"

    modal.innerHTML = `
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
        <p class="mt-2 text-sm text-gray-600">${message}</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button id="cancel-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          ${cancelText}
        </button>
        <button id="confirm-btn" class="px-4 py-2 text-sm font-medium text-white ${variant === "destructive" ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"} border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2">
          ${confirmText}
        </button>
      </div>
    `

    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    // Handle button clicks
    const confirmBtn = modal.querySelector("#confirm-btn")
    const cancelBtn = modal.querySelector("#cancel-btn")

    const cleanup = () => {
      document.body.removeChild(overlay)
    }

    confirmBtn?.addEventListener("click", () => {
      cleanup()
      resolve(true)
    })

    cancelBtn?.addEventListener("click", () => {
      cleanup()
      resolve(false)
    })

    // Handle escape key and overlay click
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanup()
        resolve(false)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        cleanup()
        resolve(false)
      }
    })

    document.addEventListener("keydown", handleKeyDown)

    // Focus the confirm button
    setTimeout(() => {
      ;(confirmBtn as HTMLElement)?.focus()
    }, 100)
  })
}

export const showConfirmationDialog = showConfirmation

export const confirmDelete = (itemName = "item"): Promise<boolean> => {
  return showConfirmation({
    title: "Delete Confirmation",
    message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
    confirmText: "Delete",
    cancelText: "Cancel",
    variant: "destructive",
  })
}

export const confirmAction = (action: string, itemName = "item"): Promise<boolean> => {
  return showConfirmation({
    title: "Confirm Action",
    message: `Are you sure you want to ${action} this ${itemName}?`,
    confirmText: "Confirm",
    cancelText: "Cancel",
  })
}
