import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icons";

// A single labelled dropdown used in the shop filter bar.
// options: [{ value, label }]; value: current value; onChange(value)
export default function FilterDropdown({ label, options, value, onChange, allLabel = "All" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div className={`fdrop ${open ? "open" : ""} ${value ? "active" : ""}`} ref={ref}>
      <button className="fdrop-btn" onClick={() => setOpen((o) => !o)}>
        <span>{current ? current.label : label}</span>
        <Icon.Chevron size={15} />
      </button>
      {open && (
        <div className="fdrop-menu">
          <button className={!value ? "sel" : ""} onClick={() => { onChange(""); setOpen(false); }}>{allLabel}</button>
          {options.map((o) => (
            <button key={o.value} className={value === o.value ? "sel" : ""} onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
