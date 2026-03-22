module.exports = async function handler(req, res) {
  try {
    const userId = req.query.userId;
    const cursor = req.query.cursor || "";

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const url = `https://www.pekora.zip/users/inventory/list-json?userId=${encodeURIComponent(userId)}&assetTypeId=2,11,12&cursor=${encodeURIComponent(cursor)}&itemsPerPage=100`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Upstream failed" });
    }

    const json = await response.json();
    
    // Filter to only items created by this user
    const created = (json.data || []).filter(item => 
      item.creatorTargetId === parseInt(userId) && item.creatorType === "User"
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      data: created,
      nextPageCursor: json.nextPageCursor || null
    });

  } catch (err) {
    res.status(500).json({
      error: "Proxy failed",
      details: String(err)
    });
  }
};
