import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ timestamp: new Date().getTime()});
});

export default { router };
