import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/portfolio/ThemeProvider";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light" : "Dark"}
      className={cn(
        "inline-flex h-[34px] w-[34px] flex-none items-center justify-center border border-foreground/25 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground",
        className,
      )}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}