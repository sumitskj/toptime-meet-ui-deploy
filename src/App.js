import React, { Suspense, useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  HMSRoomProvider,
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import { Box, HMSThemeProvider } from "@100mslive/react-ui";
import { AppData } from "./components/AppData/AppData.jsx";
import { BeamSpeakerLabelsLogging } from "./components/AudioLevel/BeamSpeakerLabelsLogging";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ErrorPage from "./components/ErrorPage";
import FullPageProgress from "./components/FullPageProgress";
import { Init } from "./components/init/Init";
import { KeyboardHandler } from "./components/Input/KeyboardInputManager";
import { Notifications } from "./components/Notifications";
import PostLeave from "./components/PostLeave";
import { ToastContainer } from "./components/Toast/ToastContainer";
import ThanksPage from "./components/TopTime/ThanksPage.jsx";
import WaitingRoom from "./components/TopTime/WaitingRoom.jsx";
import store from "./redux/store.js";
import { hmsActions, hmsNotifications, hmsStats, hmsStore } from "./hms.js";
import { Confetti } from "./plugins/confetti";
import { FlyingEmoji } from "./plugins/FlyingEmoji.jsx";
import { RemoteStopScreenshare } from "./plugins/RemoteStopScreenshare";
import { shadeColor } from "./common/utils";
import { FeatureFlags } from "./services/FeatureFlags";
import "./base.css";
import "./index.css";

const Conference = React.lazy(() => import("./components/conference"));
const PreviewScreen = React.lazy(() => import("./components/PreviewScreen"));

const defaultTokenEndpoint = process.env.REACT_APP_TOKEN_GENERATION_ENDPOINT;
const envPolicyConfig = JSON.parse(process.env.REACT_APP_POLICY_CONFIG || "{}");

let appName;
if (window.location.host.includes("localhost")) {
  appName = "localhost";
} else {
  appName = window.location.host.split(".")[0];
}

document.title =
  process.env.REACT_APP_TITLE || `${appName}'s ${document.title}`;

// TODO: remove now that there are options to change to portrait
const getAspectRatio = ({ width, height }) => {
  const host = process.env.REACT_APP_HOST_NAME || window.location.hostname;
  const portraitDomains = (
    process.env.REACT_APP_PORTRAIT_MODE_DOMAINS || ""
  ).split(",");
  if (portraitDomains.includes(host) && width > height) {
    return { width: height, height: width };
  }
  return { width, height };
};

export function EdtechComponent({
  tokenEndpoint = defaultTokenEndpoint,
  themeConfig: {
    aspectRatio = "1-1",
    font = "Roboto",
    color = "#2F80FF",
    theme = "dark",
    logo = "",
    headerPresent = "false",
    metadata = "",
    recordingUrl = "",
  },
  policyConfig = envPolicyConfig,
  getDetails = () => {},
  authTokenByRoomCodeEndpoint = "",
}) {
  const { 0: width, 1: height } = aspectRatio
    .split("-")
    .map(el => parseInt(el));

  return (
    <ErrorBoundary>
      <HMSThemeProvider
        themeType={theme}
        aspectRatio={getAspectRatio({ width, height })}
        theme={{
          colors: {
            brandDefault: color,
            brandDark: shadeColor(color, -30),
            brandLight: shadeColor(color, 30),
            brandDisabled: shadeColor(color, 10),
          },
          fonts: {
            sans: [font, "Inter", "sans-serif"],
          },
        }}
      >
        <HMSRoomProvider
          isHMSStatsOn={FeatureFlags.enableStatsForNerds}
          actions={hmsActions}
          store={hmsStore}
          notifications={hmsNotifications}
          stats={hmsStats}
        >
          <AppData
            appDetails={metadata}
            policyConfig={policyConfig}
            recordingUrl={recordingUrl}
            logo={logo}
            tokenEndpoint={tokenEndpoint}
          />

          <Init />
          <Box
            css={{
              bg: "$mainBg",
              w: "100%",
              ...(headerPresent === "true"
                ? { flex: "1 1 0", minHeight: 0 }
                : { h: "100%" }),
            }}
          >
            <AppRoutes
              getDetails={getDetails}
              authTokenByRoomCodeEndpoint={authTokenByRoomCodeEndpoint}
            />
          </Box>
        </HMSRoomProvider>
      </HMSThemeProvider>
    </ErrorBoundary>
  );
}

const RouteList = ({ getDetails, authTokenByRoomCodeEndpoint }) => {
  return (
    <Routes>
      <Route path="preview">
        <Route
          path=":roomId/:role/:name"
          element={
            <Suspense fallback={<FullPageProgress />}>
              <PreviewScreen
                authTokenByRoomCodeEndpoint={authTokenByRoomCodeEndpoint}
              />
            </Suspense>
          }
        />
      </Route>
      <Route path="meeting">
        <Route
          path=":roomId/:role"
          element={
            <Suspense fallback={<FullPageProgress />}>
              <Conference />
            </Suspense>
          }
        />
        <Route
          path=":roomId"
          element={
            <Suspense fallback={<FullPageProgress />}>
              <Conference />
            </Suspense>
          }
        />
      </Route>
      <Route path="leave">
        <Route path=":roomId/:role" element={<PostLeave />} />
        <Route path=":roomId" element={<PostLeave />} />
      </Route>
      <Route path="/:bookingId/:role" element={<WaitingRoom />} />
      <Route path="/thanks" element={<ThanksPage />} />
      <Route path="*" element={<ErrorPage error="Invalid URL!" />} />
    </Routes>
  );
};

const BackSwipe = () => {
  const isConnectedToRoom = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  useEffect(() => {
    const onRouteLeave = async () => {
      if (isConnectedToRoom) {
        await hmsActions.leave();
      }
    };
    window.addEventListener("popstate", onRouteLeave);
    return () => {
      window.removeEventListener("popstate", onRouteLeave);
    };
  }, [hmsActions, isConnectedToRoom]);
  return null;
};

function AppRoutes({ getDetails, authTokenByRoomCodeEndpoint }) {
  return (
    <Router>
      <ToastContainer />
      <Notifications />
      <BackSwipe />
      <Confetti />
      <FlyingEmoji />
      <RemoteStopScreenshare />
      <KeyboardHandler />
      <BeamSpeakerLabelsLogging />
      <Routes>
        <Route
          path="/*"
          element={
            <RouteList
              getDetails={getDetails}
              authTokenByRoomCodeEndpoint={authTokenByRoomCodeEndpoint}
            />
          }
        />
        <Route
          path="/streaming/*"
          element={
            <RouteList
              getDetails={getDetails}
              authTokenByRoomCodeEndpoint={authTokenByRoomCodeEndpoint}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <EdtechComponent
        themeConfig={{
          aspectRatio: process.env.REACT_APP_TILE_SHAPE,
          theme: process.env.REACT_APP_THEME,
          color: process.env.REACT_APP_COLOR,
          logo: process.env.REACT_APP_LOGO,
          font: process.env.REACT_APP_FONT,
          headerPresent: process.env.REACT_APP_HEADER_PRESENT,
          metadata: process.env.REACT_APP_DEFAULT_APP_DETAILS, // A stringified object in env
        }}
      />
    </ReduxProvider>
  );
}
