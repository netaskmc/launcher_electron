import { useStore } from "@/lib/store";
import { ReactNode, useEffect } from "react";

export type SliderSection = "modpacks" | "updates" | "news";

type Props = {
  sections: {
    [k in SliderSection]: {
      node: ReactNode;
      name: string;
    };
  };
};

export const SectionSlider: React.FC<Props> = (props) => {
  const [selected, setSelected] = useStore("openedSection");
  const handleSelect = (s: SliderSection, rough?: boolean) => {
    setSelected(s);
    document
      .querySelector(`[data-section=${s}]`)
      ?.scrollIntoView({ behavior: rough ? "auto" : "smooth" });
  };

  useEffect(() => {
    const handler = () => handleSelect(selected, true);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [selected]);

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="overflow-x-hidden flex-grow"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="flex h-full">
          {Object.keys(props.sections).map((s) => (
            <div
              className="w-[100vw] flex-shrink-0 h-full p-6 pb-2"
              data-section={s}
              key={s}
            >
              <div
                className={`
                  transition-transform p-8 rounded-xl bg-black h-full
                  ${selected === s ? "" : "scale-90"}
                `}
              >
                {props.sections[s as SliderSection].node}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center text-sm">
        {Object.keys(props.sections).map((s) => (
          <button
            className={`
              p-4 uppercase tracking-widest transition-opacity
              ${selected === s ? "" : "opacity-50"}
            `}
            key={s}
            onClick={() => handleSelect(s as SliderSection)}
          >
            {props.sections[s as SliderSection].name}
          </button>
        ))}
      </div>
    </div>
  );
};
