// api/created/[userId].js
module.exports = async function handler(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const types = [2, 11, 12]; // T-shirts, Shirts, Pants
    let allItems = [];

    for (const type of types) {
      const url = `https://www.pekora.zip/apisite/economy/v1/users/${userId}/inventory?type=${type}&limit=100`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": "https://www.pekora.zip/",
          "Origin": "https://www.pekora.zip"
        }
      });

      if (response.ok) {
        const json = await response.json();
        const created = (json.data || []).filter(item => 
          item.creatorTargetId == userId && item.creatorType === "User"
        );
        allItems.push(...created);
      }
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      data: allItems,
      count: allItems.length,
      source: "pekora.zip revival (2025)"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
