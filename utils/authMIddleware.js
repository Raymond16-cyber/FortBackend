import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { userToken } = req.cookies;

  if (!userToken) {
    return res.status(401).json({ error: "Please login first" });
  }

  const decoded = await jwt.verify(userToken, process.env.JWT_SECRET); // throws if invalid

  req.myID = decoded.id;
  next();
};

export default authMiddleware;
