import { useState } from "react";
import { AwaitingNeTaskSession, Session } from "@/lib/auth";
import { Login } from "@/screens/Login";
import { Launcher } from "@/screens/Launcher";
import { ipcRenderer } from "electron";
import os from "node:os";
import { useSession_OnceInAppOrEverythingBreaks } from "@/lib/store";

export const appVersion = (await ipcRenderer.invoke(
  "request-app-version"
)) as string;

export const osType = {
  aix: "AIX OS",
  android: "Android",
  cygwin: "Windows (cygwin)",
  darwin: "macOS",
  freebsd: "FreeBSD",
  haiku: "Haiku OS",
  linux: "Linux",
  netbsd: "NetBSD",
  openbsd: "OpenBSD",
  sunos: "Solaris",
  win32: "Windows",
}[os.platform()];

const App: React.FC = () => {
  const [sessionState, setSessionState] =
    useSession_OnceInAppOrEverythingBreaks();

  const [loginPageVisible, setLoginPageVisible] = useState<boolean>(
    sessionState.type === "none"
  );

  return (
    <>
      <Launcher
        session={sessionState}
        blur={loginPageVisible}
        bringUpLogin={() => setLoginPageVisible(true)}
      />
      <Login
        session={sessionState}
        show={loginPageVisible}
        hide={() => setLoginPageVisible(false)}
        canClose={
          !(
            sessionState.type === "none" ||
            (sessionState.type === "awaiting-netask-id" &&
              sessionState.firstTime)
          )
        }
      />
    </>
  );
};

export default App;
