module.exports = async function handler(req, res) {
  try {
    const userId = req.query.userId;
    const cursor = req.query.cursor || "";

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Type 19 = T-Shirts, 11 = Shirts, 12 = Pants
    // Fetch all three types
    const types = [2, 11, 12]; // Updated: 2 for T-shirts (not 19)
    let allItems = [];

    for (const type of types) {
      const url = `https://www.pekora.zip/apisite/economy/v2/users/${encodeURIComponent(userId)}/inventory?type=${type}&cursor=${encodeURIComponent(cursor)}&limit=100`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (!response.ok) continue; // Skip failed types

      const json = await response.json();
      
      // Filter to only items created by this user
      const created = (json.data || []).filter(item => 
        item.creatorTargetId === parseInt(userId) && item.creatorType === "User"
      );

      allItems = allItems.concat(created);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      data: allItems,
      count: allItems.length
    });

  } catch (err) {
    res.status(500).json({
      error: "Proxy failed",
      details: String(err)
    });
  }
};
