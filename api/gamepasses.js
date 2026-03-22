module.exports = async function handler(req, res) {
  try {
    const gameId = req.query.gameId;

    if (!gameId) {
      return res.status(400).json({ error: "Missing gameId" });
    }

    const url =
      "https://www.pekora.zip/apisite/games/v1/games/" +
      encodeURIComponent(gameId) +
      "/game-passes?sortOrder=Asc&limit=100";

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
