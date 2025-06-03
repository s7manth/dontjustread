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
  };
  onUpdate: (settings: any) => void;
}

export function ReaderSettings({ settings, onUpdate }: ReaderSettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reading Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <div className="space-y-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
