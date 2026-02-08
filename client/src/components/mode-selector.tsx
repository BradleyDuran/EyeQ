import { Monitor, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FocusMode } from "@/lib/attention-scoring";

interface ModeSelectorProps {
  mode: FocusMode;
  onModeChange: (mode: FocusMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-2" data-testid="mode-selector">
      <Button
        variant={mode === "screen" ? "default" : "secondary"}
        size="sm"
        onClick={() => onModeChange("screen")}
        className="toggle-elevate"
        data-testid="button-mode-screen"
      >
        <Monitor className="w-3.5 h-3.5 mr-1.5" />
        Screen
      </Button>
      <Button
        variant={mode === "reading" ? "default" : "secondary"}
        size="sm"
        onClick={() => onModeChange("reading")}
        className="toggle-elevate"
        data-testid="button-mode-reading"
      >
        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
        Reading
      </Button>
    </div>
  );
}
