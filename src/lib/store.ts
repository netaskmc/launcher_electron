import { ipcRenderer } from "electron";
import fs from "node:fs";
import path from "path";
import { useEffect, useState } from "react";
import { Auth, Session } from "./auth";

const workingDir = (await ipcRenderer.invoke("currentDirectory")) as string;

class Store<T extends Record<string, any>> {
  private fileDir = path.join(workingDir, "/NeTaskLauncher");

  private filePath: string;
  private config: T;

  constructor(filename: string, defaults: T) {
    this.filePath = path.join(this.fileDir, filename);
    this.makeDirIfDoesntExist();
    console.log({ path: this.filePath, exists: this.fileExists() });
    if (this.fileExists()) {
      this.config = this.read();
    } else {
      this.config = defaults;
      this.save();
    }
  }

  private makeDirIfDoesntExist() {
    if (!fs.existsSync(this.fileDir)) fs.mkdirSync(this.fileDir);
  }

  private fileExists() {
    return fs.existsSync(this.filePath);
  }

  private read() {
    return JSON.parse(fs.readFileSync(this.filePath, "utf8")) as T;
  }

  private save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.config), "utf8");
  }

  get<K extends keyof T>(key: K) {
    return this.config[key];
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.config[key] = value;
    this.save();
  }
}

type StoreType = {
  session: Session;
  settings: {};
};

export const store = new Store<StoreType>("data.netaskcfg", {
  session: {
    type: "none",
  },
  settings: {},
});

export const auth = new Auth(store.get("session"));
auth.init();

export const useStore = <K extends keyof StoreType>(
  key: K
): [StoreType[typeof key], (p: StoreType[typeof key]) => void] => {
  const [storeValue, setStoreValue] = useState(store.get(key));

  const setter = (
    value: typeof storeValue | ((p: typeof storeValue) => typeof storeValue)
  ) =>
    setStoreValue((p) => {
      const v = typeof value === "function" ? value(p) : value;
      store.set(key, v);
      return v;
    });

  return [storeValue, setter];
};

export const useSession_OnceInAppOrEverythingBreaks = () => {
  const [session, setSession] = useStore("session");
  useEffect(() => {
    auth.updateUpdateCallback(setSession);
  }, []);
  return [session, setSession] as [
    StoreType["session"],
    (p: StoreType["session"]) => void
  ];
};
