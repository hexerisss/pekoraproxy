module.exports = async function handler(req, res) {
  try {
    const userId = req.query.userId;
    const cursor = req.query.cursor || "";

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const url =
      "https://www.pekora.zip/apisite/games/v2/users/" +
      encodeURIComponent(userId) +
      "/games?accessFilter=Public&limit=50&cursor=" +
      encodeURIComponent(cursor);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({
      error: "Proxy failed",
      details: String(err)
    });
  }
};
