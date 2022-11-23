import { appVersion, osType } from "@/App";

const apiUrl = "http://localhost:3000";
// const apiUrl = "https://netask.mlntcandy.com";

const resAfter = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class Auth {
  private session: Session;
  private updateSessionCallback?: (s: Session) => void;

  constructor(session: Session, updateSessionCallback?: (s: Session) => void) {
    this.session = session;
    if (updateSessionCallback) this.updateUpdateCallback(updateSessionCallback);
  }

  updateUpdateCallback(updateSessionCallback: (s: Session) => void) {
    this.updateSessionCallback = updateSessionCallback;
    updateSessionCallback(this.session);
  }

  async init() {
    if (!(await this.checkConnectivity()))
      throw new Error("NeTask server is unavailable");
    if (
      this.session.type !== "netask-id" &&
      this.session.type !== "awaiting-netask-id"
    )
      return;
    if (this.session.type !== "awaiting-netask-id")
      this.updateSession({
        type: "awaiting-netask-id",
        firstTime: false,
        accessToken: this.session.accessToken,
        clientToken: this.session.clientToken,
      });

    await this.awaitNTLogin();
  }

  private updateSession(session: Session) {
    this.session = session;
    if (this.updateSessionCallback) this.updateSessionCallback(this.session);
  }

  private async request<T>(endpoint: string, init?: RequestInit) {
    const res = await fetch(apiUrl + endpoint, init);
    const response = (await res.json()) as T;
    return response;
  }

  async checkConnectivity() {
    try {
      const { status } = await this.request<{ status: string }>(
        "/api/launcher/status"
      );
      if (status !== "ok") return false;
    } catch {
      return false;
    }
    return true;
  }

  async validateSession(session: Session) {
    if (session.type === "offline") return null;
    if (session.type === "none") return null;

    return await this.request<
      | {
          valid: false;
          canBeValid: boolean;
        }
      | {
          valid: true;
          ntid: {
            id: string;
            img: string | null;
            mcUsername: string;
            mcUuid: string;
            displayName: string | null;
          };
        }
    >("/api/launcher/validateSession", {
      method: "POST",
      body: JSON.stringify({
        clientToken: session.clientToken,
        accessToken: session.accessToken,
      }),
    });
  }

  private async requestNTLogin() {
    const res = await this.request<{
      clientToken: string;
      accessToken: string;
    }>("/api/launcher/requestLogin", {
      method: "POST",
      body: JSON.stringify({
        launcherInfo: {
          type: "NeTask Launcher",
          version: appVersion,
          os: osType,
        },
      }),
    });

    this.updateSession({
      type: "awaiting-netask-id",
      firstTime: true,
      clientToken: res.clientToken,
      accessToken: res.accessToken,
    });

    return `${apiUrl}/id/launcherLogin/${Buffer.from(
      JSON.stringify({ clTok: res.clientToken })
    ).toString("base64")}`;
  }

  private async awaitNTLogin() {
    while (true) {
      let result = await this.validateSession(this.session);
      if (!result) return; // if offline or already no session

      if (!result.valid && !result.canBeValid)
        // if session isn't valid [anymore]
        return this.updateSession({
          type: "none",
        });

      if (!result.valid && result.canBeValid) {
        // if it can be valid, sleep & repeat
        await resAfter(1500);
        continue;
      }

      if (this.session.type === "none" || this.session.type === "offline")
        return; // ok this is fine-ish
      if (!result.valid) return; // but why does ts think THIS is possible???? incredibly stupid

      this.updateSession({
        type: "netask-id",
        uuid: result.ntid.mcUuid,
        nickname: result.ntid.mcUsername,
        ntid: {
          name: result.ntid.displayName ?? "Unknown name",
        },
        clientToken: this.session.clientToken,
        accessToken: this.session.accessToken,
      });

      break;
    }
  }

  async invalidateSession() {
    if (this.session.type === "none" || this.session.type === "offline")
      return this.updateSession({
        type: "none",
      });

    const result = await this.request<{ status: "ok" | "bad" }>(
      "/api/launcher/invalidateSession",
      {
        method: "POST",
        body: JSON.stringify({
          clientToken: this.session.clientToken,
          accessToken: this.session.accessToken,
        }),
      }
    );
    if (result.status === "bad") throw new Error("Error logging out");

    return this.updateSession({
      type: "none",
    });
  }

  async makeLoginLinkAndPoll(onSuccess?: () => void) {
    if (this.session.type !== "none") throw new Error("Already logged in");
    const link = await this.requestNTLogin();
    this.awaitNTLogin().then(onSuccess);
    return link;
  }

  loginOffline(nickname: string) {
    this.updateSession({
      type: "offline",
      nickname,
    });
  }
}

export type SessionType = Session["type"];

export type NeTaskSession = {
  type: "netask-id";
  uuid: string;
  nickname: string;
  clientToken: string;
  accessToken: string;
  ntid: {
    name: string;
  };
};

export type AwaitingNeTaskSession = {
  type: "awaiting-netask-id";
  firstTime: boolean;
  clientToken: string;
  accessToken: string;
};

export type OfflineSession = {
  type: "offline";
  nickname: string;
};

export type EmptySession = {
  type: "none";
};

export type Session =
  | NeTaskSession
  | OfflineSession
  | AwaitingNeTaskSession
  | EmptySession;
