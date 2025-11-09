import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { userToken } = req.cookies;

  if (!userToken) {
    return res.status(401).json({ error: "Please login first" });
  }

  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    req.myID = decoded.id;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;  
