import { AwaitingNeTaskSession, Session } from "@/lib/auth";
import { auth } from "@/lib/store";
import { Button } from "@/ui/Button";
import { NeTaskIconSmall } from "@/ui/NeTaskIconSmall";
import { Profile } from "@/ui/Profile";
import { TextInput } from "@/ui/TextInput";
import { useRef, useState } from "react";
import { UserX } from "react-feather";
import { shell } from "electron";
import { useTranslation } from "react-i18next";

type Props = {
  session: Session;
  show: boolean;
  hide: () => void;
  canClose: boolean;
};

const validateNickname = (n: string) => /^[A-Za-z0-9_]{3,16}$/.test(n);

export const Login: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [offlineOpen, setOfflineOpen] = useState(false);
  const offlineNicknameRef = useRef<string>();
  return (
    <div
      className={`
      absolute inset-4 flex justify-center items-center text-center transition-transform
      ${!props.show ? "translate-y-full scale-0" : ""}
    `}
      data-container="true"
      onClick={(e) => {
        if (!props.canClose) return;
        if (!(e.target as HTMLElement).hasAttribute("data-container")) return;
        props.hide();
      }}
    >
      <div className="bg-black bg-nt-dotted shadow-xl shadow-nt-secondary/10 rounded-2xl p-10">
        <h1 className="text-xl font-bold mb-10">
          {props.session.type !== "none" ? t("account") : t("login")}
        </h1>

        {props.session.type !== "none" &&
          props.session.type !== "awaiting-netask-id" && (
            <>
              <Profile session={props.session} />
              {props.session.type === "netask-id" && (
                <Button
                  type="primary"
                  className="!w-full mt-4"
                  action={() => shell.openExternal(auth.getDashboardUrl())}
                >
                  <NeTaskIconSmall />
                  {t("manage_account")}
                </Button>
              )}
            </>
          )}

        {props.session.type === "none" && (
          <>
            <Button
              type="primary"
              className="!w-full mb-2"
              action={async () => {
                const link = await auth.makeLoginLinkAndPoll(() =>
                  props.hide()
                );
                shell.openExternal(link);
              }}
            >
              <NeTaskIconSmall />
              {t("login_with_nt")}
            </Button>
            <Button
              type="secondary"
              className="!w-full"
              action={() => setOfflineOpen((p) => !p)}
            >
              <UserX size={18} />
              {t("login_offline")}
            </Button>
            <div
              className={`transition-all ${
                offlineOpen
                  ? "mt-4 h-32"
                  : "scale-y-0 scale-x-75 opacity-0 h-0 mt-0"
              }`}
            >
              <div className="text-lg mb-4">{t("offline")}</div>
              <TextInput
                placeholder={t("nickname") ?? ""}
                valueRef={offlineNicknameRef}
                className="mb-2"
                validate={validateNickname}
              />
              <Button
                type="secondary"
                className="!w-full"
                action={() => {
                  if (!offlineNicknameRef.current) return;
                  if (!validateNickname(offlineNicknameRef.current)) return;
                  auth.loginOffline(offlineNicknameRef.current);
                  props.hide();
                }}
              >
                {t("set_nickname")}
              </Button>
            </div>
          </>
        )}

        {props.session.type === "awaiting-netask-id" &&
          props.session.firstTime && (
            <>
              <div className="text-xl">{t("wait_first_nt_login")}</div>
              <div>{t("pls_login_in_browser")}</div>
              <Button
                type="secondary"
                className="!w-full mt-4"
                action={() => auth.invalidateSession()}
              >
                {t("cancel")}
              </Button>
            </>
          )}

        {props.session.type === "awaiting-netask-id" &&
          !props.session.firstTime && (
            <>
              <div className="text-xl">{t("wait_nt_login")}</div>
            </>
          )}
      </div>
    </div>
  );
};
