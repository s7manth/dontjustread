import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reading Settings</SheetTitle>
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
  );
}
