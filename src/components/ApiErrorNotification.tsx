import { useData } from "@/lib/data-context";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export function ApiErrorNotification() {
  const { apiError } = useData();
  const [dismissed, setDismissed] = useState(false);

  if (!apiError || dismissed) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5">
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive mb-1">Backend Connection Error</h3>
            <p className="text-sm text-destructive/90">{apiError}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure the API server is running on http://localhost:3000
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-destructive/70 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
