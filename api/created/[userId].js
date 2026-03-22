module.exports = async function handler(req, res) {
  try {
    const userId = req.query.userId;
    const cursor = req.query.cursor || "";

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const types = [2, 11, 12]; // T-shirts, Shirts, Pants
    let allCreated = [];

    for (const assetTypeId of types) {
      const url = `https://www.pekora.zip/users/inventory/list-json?userId=${encodeURIComponent(userId)}&assetTypeId=${assetTypeId}&cursor=${encodeURIComponent(cursor)}&itemsPerPage=100`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (!response.ok) continue;

      const json = await response.json();

      // Filter only items created by this exact user
      const created = (json.Items || []).filter(entry => 
        entry.Item?.Creator?.Id === parseInt(userId) && 
        entry.Item?.Creator?.Type === 1 // 1 = User (not Group)
      );

      allCreated.push(...created);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      data: allCreated,
      count: allCreated.length
    });

  } catch (err) {
    res.status(500).json({
      error: "Proxy failed",
      details: String(err)
    });
  }
};
