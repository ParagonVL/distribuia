export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-40 bg-gray-200 rounded mb-8" />

      <div className="space-y-6">
        {/* Plan management card skeleton */}
        <div className="card">
          <div className="h-6 w-24 bg-gray-200 rounded mb-6" />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
          </div>
        </div>

        {/* Account info card skeleton */}
        <div className="card">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            <div>
              <div className="h-4 w-12 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-48 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Security card skeleton */}
        <div className="card">
          <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg" />
        </div>

        {/* Danger zone card skeleton */}
        <div className="card">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-full bg-gray-200 rounded mb-4" />
          <div className="h-10 w-36 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
