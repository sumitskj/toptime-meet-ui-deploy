import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ExitIcon } from "@100mslive/react-icons";
import { Box, Button, Flex, Text, textEllipsis } from "@100mslive/react-ui";
import { ToastManager } from "./Toast/ToastManager";
import { Header } from "./Header";
import { useNavigation } from "./hooks/useNavigation";
import {
  defaultPreviewPreference,
  UserPreferencesKeys,
  useUserPreferences,
} from "./hooks/useUserPreferences";
import { getRoutePrefix } from "../common/utils";
import { getTopTimeData } from "./TopTime/store/localStore";
import { submitFeedback, updateBookingStatus } from "./TopTime/api/toptimeApi";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  FormControlLabel,
  InputBase,
  Radio,
  RadioGroup,
  Rating,
} from "@mui/material";

const PostLeave = () => {
  const navigate = useNavigation();
  const { roomId, role } = useParams();
  const [previewPreference] = useUserPreferences(
    UserPreferencesKeys.PREVIEW,
    defaultPreviewPreference
  );

  const storedToptimeData = JSON.parse(getTopTimeData(roomId));
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const handleFeedbackDialogOpen = () => {
    setOpenFeedbackModal(true);
  };
  const handleFeedbackDialogClose = () => {
    setOpenFeedbackModal(false);
  };
  const FillFeedbackDialog = () => {
    const [satisfied, setSatisfied] = useState(() => 2);
    const [feedback, setFeedback] = useState(() => "");
    const [rating, setRating] = useState(() => 3.0);
    const [error, setError] = useState(false);
    const feedbackInputCallback = event => {
      setFeedback(event.target.value);
    };

    const handleFillFeedback = async () => {
      try {
        const payload = {
          rating: role === "professional" ? null : rating,
          bookingId: storedToptimeData.bookingId,
          feedbackStatus: satisfied,
          feedback: feedback,
          isProfessional: role === "professional" ? true : false,
        };
        console.log("submit feedback payload: ", payload);
        const confirmRes = await submitFeedback(
          payload,
          storedToptimeData.token
        );
        if (confirmRes.ok) {
          handleFeedbackDialogClose();
          // navigate
          navigate('/thanks');
        } else {
          setError(true);
          console.error("Error in submitting feedback : ", confirmRes.status);
        }
      } catch (err) {
        console.error("Error in submitting feedback : ", err);
        setError(true);
      }
    };

    return (
      <Dialog open={openFeedbackModal} onClose={handleFeedbackDialogClose}>
        <DialogTitle sx={{ fontSize: "1.4rem" }}>
          How was your call? Please give us a feedback, to improve your
          experience
        </DialogTitle>
        <hr
          style={{
            width: "100%",
            backgroundColor: "#9E9E9EFF",
            height: "1px",
            border: "0",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 2rem",
            }}
          >
            <div style={{ fontWeight: "400" }}>Rating</div>
            <Rating
              size="large"
              value={rating}
              precision={0.5}
              onChange={(event, newRating) => setRating(newRating)}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 2rem",
            }}
          >
            <div style={{ fontWeight: "400" }}>
              Are you satisfied with the call
            </div>
            <div>
              <RadioGroup
                row
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={satisfied}
                onChange={event => setSatisfied(event.target.value)}
              >
                <FormControlLabel
                  value={2}
                  control={<Radio color="success" />}
                  label="Yes"
                />
                <FormControlLabel
                  value={1}
                  control={<Radio color="success" />}
                  label="No"
                />
              </RadioGroup>
            </div>
          </div>
          <div
            style={{
              padding: "1rem 2rem",
            }}
          >
            <div>Feedback</div>
            <div
              style={{
                marginTop: "1rem",
                borderRadius: "10px",
                padding: "0.4rem",
                border: "1px solid grey",
              }}
            >
              <InputBase
                placeholder="I had a nice time..."
                autoComplete="true"
                fullWidth={true}
                multiline={true}
                value={feedback}
                onChange={feedbackInputCallback}
              />
            </div>
          </div>
          {error && (
            <div style={{ fontWeight: "300", color: "red", margin: "1rem" }}>
              Failed to save feedback. Please try again.
            </div>
          )}
        </div>
        <DialogActions>
          <div
            style={{
              position: "relative",
              width: "100%",
              margin: "1rem",
            }}
          >
            <Button
              style={{
                width: "100%",
                backgroundColor: "black",
                color: "white",
              }}
              onClick={handleFillFeedback}
            >
              Save my experience
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Flex direction="column" css={{ size: "100%" }}>
      <Box css={{ h: "$18", "@md": { h: "$17" } }} data-testid="header">
        <Header isPreview />
      </Box>
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
          You left the {getRoutePrefix() ? "stream" : "room"}
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
          Have a nice day
          {previewPreference.name && (
            <Box as="span" css={{ ...textEllipsis(100) }}>
              , {previewPreference.name}
            </Box>
          )}
          !
        </Text>
        <Flex css={{ mt: "$14", gap: "$10", alignItems: "center" }}>
          <Text
            variant="body1"
            css={{ color: "$textMedEmp", fontWeight: "$regular" }}
          >
            Is your call completed. If selected yes, you will not be able to
            rejoin.
          </Text>
          <Button
            style={{ backgroundColor: "green", border: "0" }}
            onClick={() => {
              // update status
              const payload = {
                bookingId: storedToptimeData.bookingId,
                status: 5,
              };
              updateBookingStatus(payload, storedToptimeData.token);
              //redirect feedback page
              handleFeedbackDialogOpen();
            }}
            data-testid="join_again_btn"
          >
            <ExitIcon />
            <Text css={{ ml: "$3", fontWeight: "$semiBold", color: "inherit" }}>
              Call Completed
            </Text>
          </Button>
          <FillFeedbackDialog />
        </Flex>
        <Flex css={{ mt: "$14", gap: "$10", alignItems: "center" }}>
          <Text
            variant="body1"
            css={{ color: "$textMedEmp", fontWeight: "$regular" }}
          >
            Left by mistake?
          </Text>
          <Button
            onClick={() => {
              let rejoinUrl =
                "/" +
                storedToptimeData.bookingId +
                "/" +
                role +
                "?auth_token=" +
                storedToptimeData.token;
              navigate(rejoinUrl);
              ToastManager.clearAllToast();
            }}
            data-testid="join_again_btn"
          >
            <ExitIcon />
            <Text css={{ ml: "$3", fontWeight: "$semiBold", color: "inherit" }}>
              Rejoin
            </Text>
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PostLeave;
