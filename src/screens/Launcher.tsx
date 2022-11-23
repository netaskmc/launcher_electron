import { appVersion } from "@/App";
import { AwaitingNeTaskSession, Session } from "@/lib/auth";
import { Button } from "@/ui/Button";
import { Profile } from "@/ui/Profile";
import { Settings } from "react-feather";

type Props = {
  session: Session | AwaitingNeTaskSession | null;
  blur: boolean;
  bringUpLogin: () => void;
};

export const Launcher: React.FC<Props> = (props) => {
  return (
    <div
      className={`
      w-full h-full flex flex-col
      transition-all
      ${props.blur ? "blur-md" : "blur-0"}
    `}
    >
      <div className="bg-black bg-nt-dotted h-16 flex items-center gap-4 p-4 justify-between">
        {/* <img src="logo.svg" alt="NeTask Logo" className="h-8" /> */}
        <img src="ntlauncher.svg" alt="NeTask Launcher Logo" className="h-8" />
        <span className="opacity-50 text-xs">v{appVersion}</span>
      </div>
      <div className="flex-grow">content</div>
      <div className="bg-black bg-nt-dotted h-20 flex items-center p-3 gap-3">
        <button
          className="block p-0 border-none transition-transform hover:scale-95"
          onClick={props.bringUpLogin}
        >
          <Profile session={props.session} compact />
        </button>
        <Button type="primary" action={() => {}} className="flex-grow h-14">
          Launch
        </Button>
        <Button
          type="secondary"
          action={() => {}}
          className="h-full aspect-square flex-shrink-0"
        >
          <Settings size={21} />
        </Button>
      </div>
    </div>
  );
};
