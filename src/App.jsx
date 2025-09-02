import React, { useEffect, useRef, useState } from "react";

const Button = ({ label, onClick, variant = "default", span = 1, title }) => {
  const base =
    "select-none rounded-2xl py-3 text-lg font-medium shadow active:scale-[0.98] focus:outline-none transition";
  const palette = {
    default: "bg-slate-700 hover:bg-slate-600",
    op: "bg-indigo-600 hover:bg-indigo-500",
    danger: "bg-rose-600 hover:bg-rose-500",
    ghost: "bg-slate-600/60 hover:bg-slate-500/60",
  };
  return (
    <button
      title={title || label}
      onClick={onClick}
      className={`${base} ${palette[variant]} col-span-${span}`}
    >
      {label}
    </button>
  );
};

const format = (numStr) => {
  if (numStr === "" || numStr === "-") return numStr;
  const n = Number(numStr);
  if (!isFinite(n)) return "Error";
  if (numStr.endsWith(".")) return n.toLocaleString();
  const [int, dec] = numStr.split(".");
  const intFmt = Number(int).toLocaleString();
  return dec !== undefined ? `${intFmt}.${dec}` : intFmt;
};

function compute(a, op, b) {
  const x = Number(a),
    y = Number(b);
  if (!isFinite(x) || !isFinite(y)) return "Error";
  let res;
  switch (op) {
    case "+":
      res = x + y;
      break;
    case "-":
      res = x - y;
      break;
    case "×":
    case "*":
      res = x * y;
      break;
    case "÷":
    case "/":
      res = y === 0 ? NaN : x / y;
      break;
    case "%":
      res = x % y;
      break;
    default:
      return y.toString();
  }
  return isFinite(res) ? res.toString() : "Error";
}

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [a, setA] = useState(null);
  const [op, setOp] = useState(null);
  const [b, setB] = useState(null);
  const [overwrite, setOverwrite] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if ((k >= "0" && k <= "9") || k === ".") {
        e.preventDefault();
        inputDigit(k);
        return;
      }
      if (["+","-","*","/","%"].includes(k)) { e.preventDefault(); chooseOp(k); return; }
      if (k === "Enter" || k === "=") { e.preventDefault(); equals(); return; }
      if (k === "Backspace") { e.preventDefault(); del(); return; }
      if (k === "Escape" || k === "Delete") { e.preventDefault(); clearAll(); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const clearAll = () => {
    setDisplay("0"); setA(null); setB(null); setOp(null); setOverwrite(false);
  };

  const del = () => {
    if (overwrite) { setDisplay("0"); setOverwrite(false); return; }
    if (op === null) {
      const next = display.length <= 1 ? "0" : display.slice(0, -1);
      setDisplay(next);
    } else {
      if (b === null || b === "0") { setB(null); setDisplay("0"); }
      else {
        const next = b.length <= 1 ? "0" : b.slice(0, -1);
        setB(next); setDisplay(next);
      }
    }
  };

  const inputDigit = (d) => {
    if (overwrite) { setDisplay(d === "." ? "0." : d); setA(null); setB(null); setOp(null); setOverwrite(false); return; }
    if (op === null) {
      let next = display === "0" && d !== "." ? d : (display + d);
      if (d === "." && display.includes(".")) return;
      setDisplay(next);
    } else {
      let cur = b ?? "0";
      if (d === "." && cur.includes(".")) return;
      let next = (cur === "0" && d !== ".") ? d : (cur + d);
      setB(next); setDisplay(next);
    }
  };

  const toggleSign = () => {
    if (op === null) {
      setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
    } else {
      const cur = b ?? "0";
      const next = cur.startsWith("-") ? cur.slice(1) : "-" + cur;
      setB(next); setDisplay(next);
    }
  };

  const chooseOp = (nextOp) => {
    if (op === null) {
      setA(display);
      setOp(nextOp);
      setOverwrite(false);
    } else if (b !== null) {
      const result = compute(a ?? display, op, b);
      setA(result);
      setDisplay(result);
      setB(null);
      setOp(nextOp);
    } else {
      setOp(nextOp);
    }
  };

  const equals = () => {
    if (op === null) return;
    const result = compute(a ?? "0", op, b ?? display);
    setDisplay(result);
    setA(result);
    setB(null);
    setOp(null);
    setOverwrite(true);
  };

  const gridBtn = (label, handler, variant="default", title) => (
    <Button key={label} label={label} onClick={handler} variant={variant} title={title}/>
  );

  return (
    <div className="rounded-3xl p-6 bg-slate-800/60 backdrop-blur border border-white/10 shadow-lg">
      <div className="mb-4 rounded-2xl bg-slate-900/60 border border-white/10 p-4 text-right font-mono">
        <div className="text-slate-400 text-xs uppercase">Display</div>
        <div className="text-3xl font-semibold break-all tabular-nums">
          {format(display)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {gridBtn("C", clearAll, "danger", "Clear")}
        {gridBtn("±", toggleSign, "ghost", "Toggle sign")}
        {gridBtn("%", () => chooseOp("%"), "op")}
        {gridBtn("÷", () => chooseOp("/"), "op")}

        {gridBtn("7", () => inputDigit("7"))}
        {gridBtn("8", () => inputDigit("8"))}
        {gridBtn("9", () => inputDigit("9"))}
        {gridBtn("×", () => chooseOp("*"), "op")}

        {gridBtn("4", () => inputDigit("4"))}
        {gridBtn("5", () => inputDigit("5"))}
        {gridBtn("6", () => inputDigit("6"))}
        {gridBtn("-", () => chooseOp("-"), "op")}

        {gridBtn("1", () => inputDigit("1"))}
        {gridBtn("2", () => inputDigit("2"))}
        {gridBtn("3", () => inputDigit("3"))}
        {gridBtn("+", () => chooseOp("+"), "op")}

        {gridBtn("0", () => inputDigit("0"))}
        {gridBtn(".", () => inputDigit("."))}
        {gridBtn("DEL", del, "ghost", "Delete")}
        {gridBtn("=", equals, "op")}
      </div>
    </div>
  );
}

export default Calculator;