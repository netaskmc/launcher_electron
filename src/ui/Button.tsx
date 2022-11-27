import React, { useState } from "react";

type Props = React.PropsWithChildren<{
  action: (() => unknown | Promise<unknown>) | string;
  type: "primary" | "secondary";
  className?: string;
}>;

export const Button: React.FC<Props> = (props) => {
  const NativeButton: React.FC<
    React.PropsWithChildren<{
      className: string;
      action: () => unknown | Promise<unknown>;
    }>
  > = (p) => {
    const [isLoading, setLoading] = useState(false);

    const handle = () => {
      let act = async () => await p.action();
      act().then(() => setLoading(false));
      setLoading(true);
    };
    return (
      <button onClick={handle} className={p.className}>
        {/* {isLoading ?  : <></>} */}
        {props.children}
      </button>
    );
  };

  const Btn = (p: { className: string }) =>
    typeof props.action === "function" ? (
      <NativeButton action={props.action} className={p.className}>
        {props.children}
      </NativeButton>
    ) : (
      <a href={props.action} className={p.className}>
        {props.children}
      </a>
    );

  return (
    <Btn
      className={`
        flex gap-2 px-3 py-2 rounded-md w-fit scale-100 hover:scale-95 transition-transform justify-center items-center
        relative
        ${
          props.type === "primary"
            ? "bg-gradient-to-r from-nt-secondary to-nt-primary"
            : ""
        }
        ${props.type === "secondary" ? "bg-nt-gray" : ""}

        ${props.className ?? ""}
      `}
    />
  );
};
