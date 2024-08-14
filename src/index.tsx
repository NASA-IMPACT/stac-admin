import { ColorModeScript } from "@chakra-ui/react";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import WrappedApp from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = ReactDOM.createRoot(container);

// root.render(
//   <React.StrictMode>
//     <ColorModeScript />
//     <WrappedApp />
//   </React.StrictMode>,
// );
root.render(
  <>
    <ColorModeScript />
    <WrappedApp />
  </>,
);

serviceWorker.unregister();
reportWebVitals();
