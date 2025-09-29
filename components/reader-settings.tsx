import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Command } from "lucide-react";

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
  { id: "default", name: "Default", font: "Inter", fontSize: 16, lineHeight: 1.6, background: "#ffffff", color: "#111111" },
  { id: "serif-day", name: "Serif Day", font: "Georgia", fontSize: 18, lineHeight: 1.7, background: "#fffdf7", color: "#1a1a1a" },
  { id: "serif-night", name: "Serif Night", font: "Georgia", fontSize: 18, lineHeight: 1.7, background: "#0b0b0b", color: "#f2f2f2" },
  { id: "newsprint", name: "Newsprint", font: "Charter", fontSize: 17, lineHeight: 1.65, background: "#f6f2e8", color: "#2b2b2b" },
  { id: "dim", name: "Dim", font: "Inter", fontSize: 17, lineHeight: 1.7, background: "#1e1e1e", color: "#e6e6e6" },
  { id: "sepia", name: "Sepia", font: "Georgia", fontSize: 17, lineHeight: 1.65, background: "#f4ecd8", color: "#2a2a2a" },
];

export function ReaderSettings({ settings, onUpdate, triggerStyle, open, onOpenChange }: ReaderSettingsProps) {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    try {
      const platform = (navigator as any)?.userAgentData?.platform || navigator.platform || "";
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(platform));
    } catch {}
  }, []);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" style={triggerStyle}>
          <span>Settings</span>
          <span className="ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs opacity-75 border" style={{ borderColor: triggerStyle?.borderColor }}>
            {isMac ? (
              <>
                <Command className="h-4 w-4" />
                <span>K</span>
              </>
            ) : (
              <>
                <span className="font-mono">Ctrl</span>
                <span>+</span>
                <span>K</span>
              </>
            )}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent style={{ ...triggerStyle, background: settings.color, color: settings.background, fontFamily: settings.font }}>
        <DialogHeader>
          <DialogTitle>Reading Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.id}
                  variant={settings.presetId === p.id ? "default" : "outline"}
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
                  style={{ background: p.color, color: p.background, fontFamily: p.font }}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Slider
              value={[settings.fontSize]}
              min={12}
              max={24}
              step={1}
              onValueChange={([value]) =>
                onUpdate({ ...settings, fontSize: value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Line Height</Label>
            <Slider
              value={[settings.lineHeight * 10]}
              min={10}
              max={20}
              step={1}
              onValueChange={([value]) =>
                onUpdate({ ...settings, lineHeight: value / 10 })
              }
            />
          </div>
          {/* <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={settings.font}
              onValueChange={(value) => onUpdate({ ...settings, font: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Charter">Charter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Background</Label>
            <input
              type="color"
              value={settings.background || "#ffffff"}
              onChange={(e) => onUpdate({ ...settings, background: e.target.value })}
              className="h-9 w-full rounded-md border px-2 py-1"
            />
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <input
              type="color"
              value={settings.color || "#111111"}
              onChange={(e) => onUpdate({ ...settings, color: e.target.value })}
              className="h-9 w-full rounded-md border px-2 py-1"
            />
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
