export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded mb-8" />

      {/* Form card skeleton */}
      <div className="card">
        {/* Usage badge skeleton */}
        <div className="h-6 w-32 bg-gray-200 rounded-full mb-6" />

        {/* Input type tabs skeleton */}
        <div className="flex gap-2 mb-6">
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        </div>

        {/* Input field skeleton */}
        <div className="h-12 w-full bg-gray-200 rounded-lg mb-6" />

        {/* Platform selector skeleton */}
        <div className="mb-6">
          <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
          <div className="flex gap-3">
            <div className="h-12 w-32 bg-gray-200 rounded-lg" />
            <div className="h-12 w-32 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Tone selector skeleton */}
        <div className="mb-6">
          <div className="h-5 w-16 bg-gray-200 rounded mb-3" />
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-gray-200 rounded-full" />
            <div className="h-10 w-28 bg-gray-200 rounded-full" />
            <div className="h-10 w-28 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Submit button skeleton */}
        <div className="h-12 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
