export const getTopTimeAuth = () => {
  return localStorage.getItem("auth-top-time");
};

export const storeTopTimeAuth = data => {
  localStorage.setItem("auth-top-time", JSON.stringify(data));
};
