module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = req.query.userId; 
    const cursor = req.query.cursor || "";
    const page = req.query.page || "";

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const types = [2, 11, 12];
    const parsedUserId = parseInt(userId, 10);
    
    // We will store debug info here to see what is failing
    const debugLogs = [];

    const fetchPromises = types.map(async (assetTypeId) => {
      let url = `https://www.pekora.zip/users/inventory/list-json?userId=${encodeURIComponent(userId)}&assetTypeId=${assetTypeId}&itemsPerPage=100`;
      
      if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
      if (page) url += `&page=${encodeURIComponent(page)}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
      });

      // Log the HTTP status code
      debugLogs.push({
         assetTypeId: assetTypeId,
         status: response.status,
         statusText: response.statusText
      });

      if (!response.ok) {
         // If it failed, grab the first 200 characters of the error (e.g., Cloudflare block)
         const text = await response.text();
         debugLogs.push({ assetTypeId, error: text.substring(0, 200) });
         return [];
      }

      const json = await response.json();
      
      // Look at the raw structure
      const items = json?.Data?.Items || [];
      
      debugLogs.push({
         assetTypeId: assetTypeId,
         rawItemsFound: items.length,
      });

      // Filter
      return items.filter(entry => 
        entry.Item?.Creator?.Id === parsedUserId && 
        entry.Item?.Creator?.Type === 1
      );
    });

    const results = await Promise.all(fetchPromises);
    const allCreated = results.flat();

    res.status(200).json({
      data: allCreated,
      count: allCreated.length,
      debug: debugLogs // <--- Look at this in your browser!
    });

  } catch (err) {
    res.status(500).json({
      error: "Proxy failed",
      details: String(err)
    });
  }
};
