import { Flex, Text } from "@100mslive/react-ui";

const ThanksPage = () => {
  return (
    <Flex direction="column" css={{ size: "100%" }}>
      <Flex
        justify="center"
        direction="column"
        align="center"
        css={{ bg: "$mainBg", flex: "1 1 0", position: "relative" }}
      >
        <Text variant="h2" css={{ fontWeight: "$semiBold" }}>
          👋
        </Text>
        <Text
          variant="h4"
          css={{ color: "$textHighEmp", fontWeight: "$semiBold", mt: "$12" }}
        >
          Your meeting is completed
        </Text>
        <Text
          variant="body1"
          css={{
            color: "$textMedEmp",
            mt: "$8",
            fontWeight: "$regular",
            textAlign: "center",
          }}
        >
          Have a nice day!
        </Text>
      </Flex>
    </Flex>
  );
};

export default ThanksPage;
