import { useEffect, type CSSProperties } from "react";

export function AnimatedBackground() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".spotlight-card");

    const handleMouseMove = (ev: MouseEvent) => {
      cards.forEach((card) => {
        const blob = card.querySelector<HTMLElement>(".blob");
        const fblob = card.querySelector<HTMLElement>(".fake-blob");
        if (!blob || !fblob) return;

        const rec = fblob.getBoundingClientRect();
        blob.style.opacity = "1";
        blob.animate(
          [
            {
              transform: `translate(${
                ev.clientX - rec.left - rec.width / 2
              }px, ${ev.clientY - rec.top - rec.height / 2}px)`,
            },
          ],
          { duration: 300, fill: "forwards" },
        );
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <img
        src="/A.webp"
        alt=""
        className="floating-shape absolute -left-6 top-24 w-24 blur-[1px] md:w-32"
        style={
          {
            "--float-anim": "float-a",
            "--float-duration": "9s",
            "--fade-duration": "11s",
            "--float-delay": "0s",
          } as CSSProperties
        }
      />
      <img
        src="/B.webp"
        alt=""
        className="floating-shape absolute right-[8%] top-12 w-20 blur-[1px] md:w-28"
        style={
          {
            "--float-anim": "float-b",
            "--float-duration": "11s",
            "--fade-duration": "13s",
            "--float-delay": "1.5s",
          } as CSSProperties
        }
      />
      <img
        src="/C.webp"
        alt=""
        className="floating-shape absolute bottom-16 left-[12%] w-24 blur-[1px] md:w-32"
        style={
          {
            "--float-anim": "float-c",
            "--float-duration": "10s",
            "--fade-duration": "12s",
            "--float-delay": "0.8s",
          } as CSSProperties
        }
      />
      <img
        src="/A.webp"
        alt=""
        className="floating-shape absolute -right-4 bottom-24 w-16 blur-[1px] md:w-20"
        style={
          {
            "--float-anim": "float-c",
            "--float-duration": "13s",
            "--fade-duration": "9s",
            "--float-delay": "2.2s",
          } as CSSProperties
        }
      />
    </div>
  );
}
