import { ReactNode } from "react";
import { AlertTriangle, Info, XOctagon } from "react-feather";
import toast, { Toaster } from "react-hot-toast";
import css from "./toast.module.css";
export const NToaster = () => (
  <Toaster position="top-right" reverseOrder={false} />
);

export const ntoast = (content: ReactNode, type: "info" | "warn" | "error") => {
  toast.custom((t) => (
    <div
      className={`
      transition-all border-2 rounded-lg max-w-md w-full bg-nt-gray text-white flex items-center p-4 gap-4 cursor-pointer
      ${t.visible ? css.animateIn : css.animateOut}

      ${type === "info" ? "border-blue-400" : ""}
      ${type === "warn" ? "border-yellow-500" : ""}
      ${type === "error" ? "border-red-500" : ""}
      `}
      onClick={() => toast.remove(t.id)}
    >
      {type === "info" && <Info size={24} />}
      {type === "warn" && <AlertTriangle size={24} />}
      {type === "error" && <XOctagon size={24} />}

      <div>{content}</div>
    </div>
  ));
};
