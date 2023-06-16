import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { usePrevious } from "react-use";
import {
  HMSRoomState,
  selectAppData,
  selectIsConnectedToRoom,
  selectRoomState,
  useHMSActions,
  selectRemotePeers,
  useHMSStore,
} from "@100mslive/react-sdk";
import { Box, Flex } from "@100mslive/react-ui";
import { ConferenceMainView } from "../layouts/mainView";
import { Footer } from "./Footer";
import FullPageProgress from "./FullPageProgress";
import { Header } from "./Header";
import { RoleChangeRequestModal } from "./RoleChangeRequestModal";
import { useIsHeadless } from "./AppData/useUISettings";
import { useNavigation } from "./hooks/useNavigation";
import {
  APP_DATA,
  EMOJI_REACTION_TYPE,
  isAndroid,
  isIOS,
  isIPadOS,
} from "../common/constants";
import { useDispatch, useSelector } from "react-redux";
import {
  markCallJoined,
  updateBookingOnCallStart,
} from "./TopTime/api/toptimeApi";
import moment from "moment/moment";
import { setTimerState } from "./TopTime/slice/timerControlSlice";
import { setBookings } from "./TopTime/slice/bookingSlice";
import { getTopTimeData, storeTopTimeData } from "./TopTime/store/localStore";

const Conference = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const { roomId, role } = useParams();
  const isHeadless = useIsHeadless();
  const roomState = useHMSStore(selectRoomState);
  const prevState = usePrevious(roomState);
  const isConnectedToRoom = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  const [hideControls, setHideControls] = useState(false);
  const dropdownList = useHMSStore(selectAppData(APP_DATA.dropdownList));
  const headerRef = useRef();
  const footerRef = useRef();
  const dropdownListRef = useRef();
  const performAutoHide = hideControls && (isAndroid || isIOS || isIPadOS);
  const bookingData = useSelector(state => state.booking);
  const authData = useSelector(state => state.auth);
  const remotePeers = useHMSStore(selectRemotePeers);

  const toggleControls = e => {
    if (dropdownListRef.current?.length === 0) {
      setHideControls(value => !value);
    }
  };

  useEffect(() => {
    let timeout = null;
    dropdownListRef.current = dropdownList || [];
    if (dropdownListRef.current.length === 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (dropdownListRef.current.length === 0) {
          setHideControls(true);
        }
      }, 5000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [dropdownList, hideControls]);

  useEffect(() => {
    if (!roomId) {
      navigate(`/`);
      return;
    }
    if (
      !prevState &&
      !(
        roomState === HMSRoomState.Connecting ||
        roomState === HMSRoomState.Reconnecting ||
        isConnectedToRoom
      )
    ) {
      const storedToptimeData = JSON.parse(getTopTimeData(roomId));
      navigate(
        `/${storedToptimeData.bookingId}/${role}?auth_token=${storedToptimeData.token}`
      );
    }
  }, [isConnectedToRoom, prevState, roomState, navigate, role, roomId]);

  useEffect(() => {
    // beam doesn't need to store messages, saves on unnecessary store updates in large calls
    if (isHeadless) {
      hmsActions.ignoreMessageTypes(["chat", EMOJI_REACTION_TYPE]);
    }
  }, [isHeadless, hmsActions]);

  useEffect(() => {
    storeTopTimeData(roomId, {
      bookingId: bookingData.bookingId,
      token: authData,
    });
    if (isConnectedToRoom) {
      // call markCallJoined
      const callJoinedPayload = {
        bookingId: bookingData.bookingId,
        isUser: role === "user" ? true : false,
      };
      markCallJoined(callJoinedPayload, authData);
      if (bookingData.callStartedTime !== null) {
        console.log("setting timer active 2");
        dispatch(setTimerState(true));
      }
    }
  }, [isConnectedToRoom]);

  useEffect(() => {
    if (remotePeers !== null && remotePeers.length === 1) {
      console.log("remote peer joined");
      if (role === "professional") {
        const payload = {
          bookingId: bookingData.bookingId,
          callStartedTime: moment().toISOString(),
        };
        updateBookingOnCallStart(payload, authData);
        let tmp = JSON.parse(JSON.stringify(bookingData));
        tmp.callStartedTime = moment().toISOString();
        dispatch(setBookings(tmp));
      }
      if (bookingData.callStartedTime === null) {
        console.log("setting timer active 1");
        dispatch(setTimerState(true));
      }
    }
  }, [remotePeers]);

  if (!isConnectedToRoom) {
    return <FullPageProgress />;
  }

  return (
    <Flex css={{ size: "100%", overflow: "hidden" }} direction="column">
      {
        <Box
          ref={headerRef}
          css={{
            h: "$18",
            transition: "margin 0.3s ease-in-out",
            marginTop: performAutoHide
              ? `-${headerRef.current?.clientHeight}px`
              : "none",
            "@md": {
              h: "$17",
            },
          }}
          data-testid="header"
        >
          <Header />
        </Box>
      }
      <Box
        css={{
          w: "100%",
          flex: "1 1 0",
          minHeight: 0,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        id="conferencing"
        data-testid="conferencing"
        onClick={toggleControls}
      >
        <ConferenceMainView />
      </Box>
      {
        <Box
          ref={footerRef}
          css={{
            flexShrink: 0,
            maxHeight: "$24",
            transition: "margin 0.3s ease-in-out",
            marginBottom: performAutoHide
              ? `-${footerRef.current?.clientHeight}px`
              : undefined,
            "@md": {
              maxHeight: "unset",
            },
          }}
          data-testid="footer"
        >
          <Footer />
        </Box>
      }
      <RoleChangeRequestModal />
    </Flex>
  );
};

export default Conference;
