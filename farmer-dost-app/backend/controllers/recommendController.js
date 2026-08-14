const { getRecommendation } = require("../utils/recommendationEngine");

exports.recommend = async (req, res, next) => {
  try {
    const { crop, season, soilType } = req.body;
    if (!crop) return res.status(400).json({ message: "crop is required" });

    const result = getRecommendation({ crop, season, soilType });
    res.json({ recommendation: result });
  } catch (err) {
    next(err);
  }
};
