export const authorizeProvider = (req, res, next) => {
  console.log("ROLE RAW:", req.user.role);
  console.log("TYPE:", typeof req.user.role);

  if (req.user.role !== "provider") {
    return res.status(403).json({ message: "Access denied. Providers only." });
  }
  next();
};
