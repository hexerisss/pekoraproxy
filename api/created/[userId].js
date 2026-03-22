module.exports = async function handler(req, res) {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    let cursor = "";
    const created = [];

    do {
      const url = `https://www.pekora.zip/users/inventory/list-json?userId=${encodeURIComponent(userId)}&assetTypeId=2,11,12&cursor=${encodeURIComponent(cursor)}&itemsPerPage=100`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (!response.ok) break;

      const json = await response.json();
      if (!json.data) break;

      for (const item of json.data) {
        if (item.creatorTargetId === parseInt(userId) && item.creatorType === "User") {
          created.push(item);
        }
      }

      cursor = json.nextPageCursor || "";
    } while (cursor);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(created);

  } catch (err) {
    res.status(500).json({
      error: "Proxy failed",
      details: String(err)
    });
  }
};
