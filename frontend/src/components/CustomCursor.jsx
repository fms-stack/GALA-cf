import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true); };
    const onOver = (e) => {
      const t = e.target;
      const interactive = t.closest("a, button, [role='button'], input, select, textarea, [data-cursor]");
      setHover(!!interactive);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!visible) return null;
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed z-[9999] hidden lg:block"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scale(${hover ? 2.4 : 1})`,
          transition: "transform 240ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className={`rounded-full border ${hover ? "border-or bg-or/10" : "border-or"} w-3 h-3`} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed z-[9998] hidden lg:block"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          transition: "left 400ms cubic-bezier(0.22,1,0.36,1), top 400ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className={`rounded-full ${hover ? "bg-or/5" : "bg-or/0"} w-10 h-10 transition-colors`} />
      </div>
    </>
  );
}
