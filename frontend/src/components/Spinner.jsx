export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-10">
      <svg className="animate-spin h-6 w-6 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-gray-500 dark:text-gray-400">{text}</span>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 animate-pulse">
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded mb-2" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800 rounded mb-1 flex gap-4 items-center px-4">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 dark:bg-gray-600 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
