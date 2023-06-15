import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const TopTimeTimer = () => {
  const timerState = useSelector(state => state.timer);
  const bookingData = useSelector(state => state.booking);
  const [curTimer, setCurTimer] = useState(null);
  let startTime = null, alreadyElapsed = 0;

  const calculateTimeLeft = () => {
    const elapsed = new Date() - startTime + alreadyElapsed;
    let timeLeft = {
      minutes: Math.floor((elapsed / 1000 / 60) % 60),
      seconds: Math.floor((elapsed / 1000) % 60),
    };
    console.log("Elapsed time : ", timeLeft);
    return timeLeft;
  };

  useEffect(() => {
    if (bookingData.callStartedTime !== null) {
      alreadyElapsed = new Date() - new Date(bookingData.callStartedTime);
      console.log("already elapsed ; ", alreadyElapsed);
    }
    startTime = new Date();
    if (timerState.start) {
      const timer = setInterval(() => {
        setCurTimer(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerState]);

  return (
    <>
      {curTimer !== null && curTimer.minutes !== undefined && (
        <div
          style={{
            color: "white",
            backgroundColor: "#0A0E0F",
            borderRadius: "10px",
            padding: "4px",
            border: "1px solid white"
          }}
        >
          {curTimer.minutes +
            ":" +
            curTimer.seconds +
            "/" +
            bookingData.duration +
            ":00"}
        </div>
      )}
    </>
  );
};

export default TopTimeTimer;
