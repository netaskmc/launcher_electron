type Props = {
  skin: string;
};

const Hat: React.FC<{ skin: string; darken: boolean }> = (p) => (
  <div
    className="absolute inset-[5%]"
    style={{
      backgroundImage: `url("${p.skin}")`,
      backgroundPosition: "-180px -36px",
      backgroundSize: "800%",
      imageRendering: "pixelated",
      ...(p.darken ? { filter: "brightness(0) blur(2px)", opacity: 0.5 } : {}),
    }}
  />
);

export const SkinHead: React.FC<Props> = (props) => (
  <div className="relative w-10 h-10">
    <div
      className="absolute inset-[10%]"
      style={{
        backgroundImage: `url("${props.skin}")`,
        backgroundPosition: "-32px -32px",
        backgroundSize: "800%",

        imageRendering: "pixelated",
      }}
    />
    <Hat skin={props.skin} darken={true} />
    <Hat skin={props.skin} darken={false} />
  </div>
);
