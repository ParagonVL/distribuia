export default function HistoryLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
