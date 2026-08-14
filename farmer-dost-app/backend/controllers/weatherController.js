const axios = require("axios");
const NodeCache = require("node-cache");

// Cache weather responses for 15 minutes to avoid hitting API rate limits
const cache = new NodeCache({ stdTTL: 900 });

exports.getWeather = async (req, res, next) => {
  try {
    const { lat, lon, city } = req.query;
    if (!lat && !lon && !city) {
      return res.status(400).json({ message: "Provide either lat & lon, or a city name" });
    }

    const cacheKey = city ? `city:${city}` : `coords:${lat},${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === "your_openweather_api_key_here") {
      return res.status(503).json({
        message: "OpenWeather API key not configured on the server. Add OPENWEATHER_API_KEY to backend/.env",
      });
    }

    const params = { appid: apiKey, units: "metric" };
    if (city) params.q = city;
    else {
      params.lat = lat;
      params.lon = lon;
    }

    const { data } = await axios.get("https://api.openweathermap.org/data/2.5/weather", { params });

    const simplified = {
      location: data.name,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      condition: data.weather?.[0]?.main,
      description: data.weather?.[0]?.description,
      windSpeed: data.wind?.speed,
      rainLastHourMM: data.rain?.["1h"] || 0,
    };

    const advice = buildFarmingAdvice(simplified);
    const payload = { weather: simplified, advice };

    cache.set(cacheKey, payload);
    res.json({ ...payload, cached: false });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ message: err.response.data?.message || "Weather API error" });
    }
    next(err);
  }
};

function buildFarmingAdvice({ temperature, humidity, condition, rainLastHourMM }) {
  const tips = [];
  if (rainLastHourMM > 0 || /rain/i.test(condition || "")) {
    tips.push("Rain detected — delay fertilizer/pesticide spraying to avoid wastage.");
  }
  if (temperature >= 35) {
    tips.push("High temperature — irrigate crops in early morning or evening to reduce water loss.");
  }
  if (humidity >= 80) {
    tips.push("High humidity — monitor crops for fungal disease risk.");
  }
  if (tips.length === 0) {
    tips.push("Weather conditions look favourable for normal farm activity.");
  }
  return tips;
}
