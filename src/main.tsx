import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/global.css";
import App from "./App";
import "./lib/i18n";
import { ntoast, NToaster } from "./lib/toast";

const onErrorHandler = (err: Error) => {
  ntoast(
    <>
      <strong>{err.name}</strong>
      <div>{err.message}</div>
    </>,
    "error"
  );
  return false;
};
window.addEventListener("error", (e) => onErrorHandler(e.error));
window.addEventListener("unhandledrejection", (e) => onErrorHandler(e.reason));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NToaster />
    <App />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
