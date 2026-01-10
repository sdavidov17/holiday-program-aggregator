import type React from 'react';
import { usePWAInstall } from '~/hooks/usePWAInstall';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, promptInstall, dismissPrompt, isDismissed } =
    usePWAInstall();

  // Don't show if already installed, dismissed, or not installable (unless iOS)
  if (isInstalled || isDismissed) return null;
  if (!isInstallable && !isIOS) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50"
      data-testid="install-prompt"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Install Parent Pilot</h3>
            <p className="text-sm text-gray-600">
              {isIOS
                ? 'Tap Share then "Add to Home Screen"'
                : 'Get quick access from your home screen'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && (
            <button
              onClick={promptInstall}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="install-button"
            >
              Install
            </button>
          )}
          <button
            onClick={dismissPrompt}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
            data-testid="dismiss-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
