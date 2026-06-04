const logoutController = {};

logoutController.logout = (req, res) => {
  try {
    res.clearCookie("authCookie");
    return res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default logoutController;