export const getTopTimeData = roomId => {
  return localStorage.getItem(roomId);
};

export const storeTopTimeData = (key, val) => {
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify(val));
  }
};
