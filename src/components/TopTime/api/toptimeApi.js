/**
 * @param {RequestInfo} url
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
const fetchWithRetry = async (url, options) => {
  const MAX_RETRIES = 4;
  let error = Error("something went wrong");
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      error = err;
    }
  }
  console.error("Fetch failed after max retries", { url, options });
  throw error;
};

const getBookingDetails = async (bookingId, authToken) => {
  try {
    console.log("AA ", authToken);
    const response = await fetchWithRetry(
      `${process.env.REACT_APP_TOPTIME_BACKEND_URI}/api/v1/booking?bookingId=${bookingId}`,
      {
        method: "GET",
        headers: { "auth-token": authToken },
      }
    );

    if (!response.ok) {
      let error = new Error("Request failed!");
      error.response = response;
      throw error;
    }
    return response;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

const getHMSTopTimeToken = async (roomId, authToken) => {
  try {
    const response = await fetchWithRetry(
      `${process.env.REACT_APP_TOPTIME_BACKEND_URI}/api/v1/call/hms/clientToken?roomId=${roomId}`,
      {
        method: "GET",
        headers: { "auth-token": authToken },
      }
    );

    if (!response.ok) {
      let error = new Error("Request failed!");
      error.response = response;
      throw error;
    }
    return response;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

const updateBookingOnCallStart = async (payload, authToken) => {
  try {
    const response = await fetchWithRetry(
      `${process.env.REACT_APP_TOPTIME_BACKEND_URI}/api/v1/booking/updateBookingOnCallStart`,
      {
        method: "PUT",
        headers: {
          "auth-token": authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let error = new Error("Request failed!");
      error.response = response;
      throw error;
    }
    return response;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

const updateBookingStatus = async (payload, authToken) => {
  try {
    const response = await fetchWithRetry(
      `${process.env.REACT_APP_TOPTIME_BACKEND_URI}/api/v1/booking/updateBookingStatus?bookingId=${payload.bookingId}&status=${payload.status}`,
      {
        method: "PUT",
        headers: {
          "auth-token": authToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let error = new Error("Request failed!");
      error.response = response;
      throw error;
    }
    return response;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

const markCallJoined = async (payload, authToken) => {
  try {
    const response = await fetchWithRetry(
      `${process.env.REACT_APP_TOPTIME_BACKEND_URI}/api/v1/booking/markCallJoined`,
      {
        method: "PUT",
        headers: {
          "auth-token": authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let error = new Error("Request failed!");
      error.response = response;
      throw error;
    }
    return response;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

const updateBookingTimer = async (payload, authToken) => {
  try {
    const response = await fetchWithRetry(
      `${process.env.REACT_APP_TOPTIME_BACKEND_URI}/api/v1/booking/updateBookingTimer?bookingId=${payload.bookingId}&callTimer=${payload.callTimer}`,
      {
        method: "PUT",
        headers: {
          "auth-token": authToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let error = new Error("Request failed!");
      error.response = response;
      throw error;
    }
    return response;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export {
  getHMSTopTimeToken,
  getBookingDetails,
  updateBookingOnCallStart,
  updateBookingStatus,
  markCallJoined,
  updateBookingTimer,
};
