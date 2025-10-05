import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Command, ArrowUp, ArrowDown, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface ReaderSettingsProps {
  settings: {
    fontSize: number;
    lineHeight: number;
    theme: string;
    font: string;
    background?: string;
    color?: string;
    presetId?: string;
  };
  onUpdate: (settings: any) => void;
  triggerStyle?: React.CSSProperties;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PRESETS: Array<{
  id: string;
  name: string;
  font: string;
  fontSize: number;
  lineHeight: number;
  background: string;
  color: string;
}> = [
  {
    id: "serif-day",
    name: "Serif Day",
    font: "Georgia",
    fontSize: 18,
    lineHeight: 1.7,
    background: "#fffdf7",
    color: "#1a1a1a",
  },
  {
    id: "serif-night",
    name: "Serif Night",
    font: "Georgia",
    fontSize: 18,
    lineHeight: 1.7,
    background: "#0b0b0b",
    color: "#f2f2f2",
  },
  {
    id: "newsprint",
    name: "Newsprint",
    font: "Noto Serif",
    fontSize: 17,
    lineHeight: 1.65,
    background: "#f6f2e8",
    color: "#2b2b2b",
  },
  {
    id: "sepia",
    name: "Sepia",
    font: "Arbutus Slab",
    fontSize: 17,
    lineHeight: 1.65,
    background: "#f4ecd8",
    color: "#2a2a2a",
  },
];

export function ReaderSettings({
  settings,
  onUpdate,
  triggerStyle,
  open,
  onOpenChange,
}: ReaderSettingsProps) {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    try {
      const platform =
        (navigator as any)?.userAgentData?.platform || navigator.platform || "";
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(platform));
    } catch {}
  }, []);
  const computedPresetId = (() => {
    if (settings.presetId) return settings.presetId;
    const match = PRESETS.find(
      (p) =>
        p.font === settings.font &&
        p.fontSize === settings.fontSize &&
        Math.abs(p.lineHeight - settings.lineHeight) < 0.01 &&
        p.background === settings.background &&
        p.color === settings.color,
    );
    return match?.id;
  })();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" style={triggerStyle} className="text-xl">
          <span>Settings</span>
          <span
            className="ml-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs opacity-75"
            style={{ borderColor: triggerStyle?.borderColor }}
          >
            {isMac ? (
              <>
                <Command className="h-4 w-4" />
                <span className="text-xl">K</span>
              </>
            ) : (
              <>
                <span className="font-mono text-xl">Ctrl</span>
                <span className="text-xl">+</span>
                <span className="text-xl">K</span>
              </>
            )}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Reading Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-xl">Presets</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
              {PRESETS.map((p) => {
                const selected = computedPresetId === p.id;
                return (
                  <Button
                    key={p.id}
                    aria-current={selected ? "true" : undefined}
                    variant={selected ? "default" : "outline"}
                    onClick={() =>
                      onUpdate({
                        ...settings,
                        font: p.font,
                        fontSize: p.fontSize,
                        lineHeight: p.lineHeight,
                        background: p.background,
                        color: p.color,
                        presetId: p.id,
                      })
                    }
                    style={{
                      background: p.background,
                      color: p.color,
                      fontFamily: p.font,
                    }}
                  >
                    <div style={{ fontFamily: p.font }}>
                      <span className="inline-flex items-center gap-2">
                        {selected && <Check className="h-4 w-4" />}
                        <span>{p.name}</span>
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="h-1" />
          <div className="flex flex-row items-center justify-around">
            <div className="flex flex-col items-center space-y-2">
              <Label className="text-lg">Font Size</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  aria-label="Decrease font size"
                  onClick={() =>
                    onUpdate({
                      ...settings,
                      fontSize: Math.max(12, settings.fontSize - 1),
                      presetId: undefined,
                    })
                  }
                >
                  <span className="text-sm leading-none">A</span>
                </Button>
                <div className="min-w-[3.5rem] text-center text-sm tabular-nums">
                  {settings.fontSize}px
                </div>
                <Button
                  variant="outline"
                  aria-label="Increase font size"
                  onClick={() =>
                    onUpdate({
                      ...settings,
                      fontSize: Math.min(24, settings.fontSize + 1),
                      presetId: undefined,
                    })
                  }
                >
                  <span className="text-xl leading-none">A</span>
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Label className="text-lg">Line Height</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  aria-label="Decrease line height"
                  onClick={() =>
                    onUpdate({
                      ...settings,
                      lineHeight: Math.max(
                        1.0,
                        parseFloat((settings.lineHeight - 0.1).toFixed(2)),
                      ),
                      presetId: undefined,
                    })
                  }
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <div className="min-w-[3.5rem] text-center text-sm tabular-nums">
                  {settings.lineHeight.toFixed(1)}
                </div>
                <Button
                  variant="outline"
                  aria-label="Increase line height"
                  onClick={() =>
                    onUpdate({
                      ...settings,
                      lineHeight: Math.min(
                        2.0,
                        parseFloat((settings.lineHeight + 0.1).toFixed(2)),
                      ),
                      presetId: undefined,
                    })
                  }
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
