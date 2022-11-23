import { MutableRefObject, useEffect, useState } from "react";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  validate?: (v: string) => boolean;
  valueRef?: MutableRefObject<string | undefined>;
};

export const TextInput: React.FC<Props> = (props) => {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (props.valueRef) props.valueRef.current = value;
  }, [value]);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      {...props}
      className={`bg-nt-gray px-3 py-2 rounded-md outline-2 outline-nt-primary 
        ${props.validate && !props.validate(value) ? "text-red-300" : ""}
        ${props.className ?? ""}
      `}
    />
  );
};
