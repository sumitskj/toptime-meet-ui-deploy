import React from "react";
import { Flex, VerticalDivider } from "@100mslive/react-ui";
import { Logo, SpeakerTag } from "./HeaderComponents";
import { ParticipantCount } from "./ParticipantList";
import { StreamActions } from "./StreamActions";
import TopTimeTimer from "../TopTime/TopTimeTimer";
import { selectIsConnectedToRoom, useHMSStore } from "@100mslive/react-sdk";

export const ConferencingHeader = ({ isPreview }) => {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  return (
    <Flex
      justify="between"
      align="center"
      css={{ position: "relative", height: "100%" }}
    >
      <Flex align="center" css={{ position: "absolute", left: "$10" }}>
        <Logo />
        <VerticalDivider css={{ ml: "$8" }} />
        {!isPreview ? <SpeakerTag /> : null}
      </Flex>

      <Flex
        align="center"
        css={{
          position: "absolute",
          right: "$10",
          gap: "$4",
        }}
      >
        <StreamActions />
        {isConnected && <TopTimeTimer />}
        <ParticipantCount />
      </Flex>
    </Flex>
  );
};
