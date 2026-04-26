import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type DropdownAlign = "left" | "right"

export function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  contentClassName,
}: {
  trigger: ReactNode
  children: ReactNode
  align?: DropdownAlign
  className?: string
  contentClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    window.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      window.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        {trigger}
      </button>
      <div
        className={cn(
          "absolute top-[calc(100%+0.75rem)] z-50 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] transition-all duration-200",
          align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-95 opacity-0",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default Dropdown
