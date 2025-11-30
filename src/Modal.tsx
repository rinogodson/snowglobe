import { Check, Copy, X } from "lucide-react";
import { useState, type SetStateAction } from "react";
import DecodeOREncode from "./services";
import { motion } from "motion/react";

function Modal({ setFn }: { setFn: React.Dispatch<SetStateAction<boolean>> }) {
  const [value, setValue] = useState("");

  const [copied, setCopied] = useState(false);

  const copyFn = () => {
    if (!value) {
      alert("Enter a name to copy!");
      return;
    }
    window.navigator.clipboard.writeText(
      (window.location.origin + "/?n=" + DecodeOREncode(value)).replaceAll(
        " ",
        "%20",
      ),
    );

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bg-black/50 w-svw h-svh z-1000 flex justify-center items-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, translateY: 200 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        exit={{ opacity: 0, scale: 0, translateY: 200 }}
        className="w-18/20 flex gap-3 origin-bottom-right sm:origin-bottom-left flex-col sm:w-100 h-fit p-5 bg-red-500/90 backdrop-blur-sm rounded-[4rem] [corner-shape:squircle] shadow-[inset_0_1px_1px_1px_rgba(255,255,255,0.2),0_1px_3px_1px_rgba(0,0,0,0.1)]"
      >
        <div className="flex flex-col gap-1">
          <div className="relative flex h-20 justify-between font-[Margarine] tracking-[1px]">
            <p className="w-[5ch]"></p>
            <input
              type="text"
              value={value}
              placeholder="Only Alphabets"
              onChange={(e) => {
                if (e.target.value.length <= 14) {
                  const cleaned = e.target.value.replace(/[^A-Za-z0-9 ]/g, "");
                  setValue(cleaned);
                }
              }}
              className="w-full h-full absolute inset-0 bg-white/50 rounded-[2.75rem] [corner-shape:squircle] border border-white/20 text-3xl px-5 text-black font-bold"
            />
          </div>
          <div className="w-full justify-between flex">
            <p className="text-white/40 pl-2 tracking-normal">
              Enter their name
            </p>
            <p className="text-white/40 pr-2 tracking-normal">14 chars</p>
          </div>
        </div>
        <div className="w-full flex gap-2">
          <button
            onClick={() => {
              setFn(false);
            }}
            className="cursor-pointer active:bg-white/30 h-12 font-bold w-full flex gap-2 justify-center items-center bg-white/20 text-xl rounded-[2.75rem] [corner-shape:squircle] border border-white/20"
          >
            <X size={20} />
            Close
          </button>
          <button
            onClick={copyFn}
            style={{
              filter: copied ? "brightness(1.1)" : "brightness(auto)",
            }}
            className="cursor-pointer active:bg-blue-500 h-12 font-bold w-full flex gap-2 justify-center items-center bg-blue-500/90 text-xl rounded-[2.75rem] [corner-shape:squircle] border border-white/20"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Modal;
