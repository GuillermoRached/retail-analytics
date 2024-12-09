export function LoadingSpinner() {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }