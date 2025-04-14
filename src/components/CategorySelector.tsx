
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategorySelectorProps {
  currentCategory: string | null;
  onChange: (category: string) => void;
}

const CATEGORIES = [
  { name: "All", color: "#6366F1" },
  { name: "Stickers", color: "#EC4899" },
  { name: "Diagrams", color: "#10B981" },
  { name: "Wireframes", color: "#F59E0B" },
  { name: "Sketches", color: "#8B5CF6" },
];

export function CategorySelector({ currentCategory, onChange }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCategory = CATEGORIES.find(
    cat => cat.name.toLowerCase() === (currentCategory || "all").toLowerCase()
  ) || CATEGORIES[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border-slate-300 dark:border-slate-700">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedCategory.color }}
          />
          <span>{selectedCategory.name}</span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {CATEGORIES.map((category) => (
          <DropdownMenuItem
            key={category.name}
            onClick={() => {
              onChange(category.name === "All" ? "" : category.name.toLowerCase());
              setOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span>{category.name}</span>
            </div>
            {selectedCategory.name === category.name && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
