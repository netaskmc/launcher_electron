import { AwaitingNeTaskSession, Session } from "@/lib/auth";
import { auth } from "@/lib/store";
import { LogOut } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { SkinHead } from "./SkinHead";

type Props = {
  session: Session | AwaitingNeTaskSession | null;
  compact?: boolean;
  className?: string;
};

export const Profile: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <div
      className={`
        bg-nt-gray rounded-lg flex items-center text-start
        ${props.compact ? "p-2 gap-2" : "p-4 gap-4"}
        ${props.className ?? ""}
      `}
    >
      <div>
        {props.session && props.session.type === "netask-id" ? (
          <SkinHead skin="Mlntcandy.png" />
        ) : (
          <SkinHead skin="noskin.png" />
        )}
      </div>
      <div className="flex-grow">
        {!!props.session && (
          <div className="text-gray-500 capitalize text-xs font-medium">
            {props.session.type === "netask-id" && (
              <>
                <span className="font-bold">{t("ntid")}</span>
                {!props.compact && ` - ${props.session.ntid.name}`}
              </>
            )}
            {props.session.type === "offline" && (
              <span className="font-bold">{t("offline")}</span>
            )}
          </div>
        )}
        <div className="">
          {!!props.session &&
            (props.session.type === "netask-id" ||
              props.session?.type === "offline") && (
              <>{props.session.nickname}</>
            )}
          {!!props.session && props.session.type === "awaiting-netask-id" && (
            <>{t("Loading")}</>
          )}
          {(!props.session || props.session.type === "none") && (
            <>{t("not_logged_in")}</>
          )}
        </div>
      </div>
      {!props.compact && (
        <div>
          <Button
            type="secondary"
            className="bg-red-400 w-10 h-10"
            action={() => auth.invalidateSession()}
          >
            <LogOut size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};
