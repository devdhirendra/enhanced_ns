export const getResponsiveClasses = () => ({
  // Container classes
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",

  // Grid classes
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-1 md:grid-cols-2",
    cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    gap: "gap-4 md:gap-6",
  },

  // Card classes
  card: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6",

  // Button classes
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors",
    danger: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors",
  },

  // Text classes
  text: {
    heading: "text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white",
    subheading: "text-base md:text-lg font-medium text-gray-700 dark:text-gray-300",
    body: "text-sm md:text-base text-gray-600 dark:text-gray-400",
  },

  // Table classes
  table: {
    container: "overflow-x-auto",
    table: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
    header: "bg-gray-50 dark:bg-gray-800",
    headerCell:
      "px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
    row: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800",
    cell: "px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
  },

  // Form classes
  form: {
    group: "space-y-1",
    label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
    input:
      "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm",
    select:
      "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm",
  },

  // Mobile-specific classes
  mobile: {
    hidden: "hidden md:block",
    only: "block md:hidden",
    stack: "flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4",
  },
})

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768
}

export const isTablet = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

export const isDesktop = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 1024
}
