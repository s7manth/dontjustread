import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function ReaderSettings({ settings, onUpdate, triggerStyle }: ReaderSettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" style={triggerStyle}>Settings</Button>
      </DialogTrigger>
      <DialogContent style={triggerStyle}>
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
