import { LoadingSpinner } from './loading-spinner';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  // The container class changes based on whether we want a full-screen overlay
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm'
    : 'w-full';

  return (
    <div className={`${containerClass} flex flex-col items-center justify-center p-8`}>
      <LoadingSpinner />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}