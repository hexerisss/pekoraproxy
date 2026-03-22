module.exports = async function handler(req, res) {
  // 1. Set CORS headers to allow requests from your frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = req.query.userId;
    // Note: The API dump shows it might use 'page' instead of 'cursor' for older Roblox endpoints, 
    // so it's safer to support both just in case.
    const cursor = req.query.cursor || "";
    const page = req.query.page || "";

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const types = [2, 11, 12]; // T-shirts, Shirts, Pants
    const parsedUserId = parseInt(userId, 10);

    // 2. Fetch all 3 asset types concurrently for much faster response times
    const fetchPromises = types.map(async (assetTypeId) => {
      let url = `https://www.pekora.zip/users/inventory/list-json?userId=${encodeURIComponent(userId)}&assetTypeId=${assetTypeId}&itemsPerPage=100`;
      
      if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
      if (page) url += `&page=${encodeURIComponent(page)}`;

      const response = await fetch(url, {
        headers: {
          // Pass a standard User-Agent to prevent getting blocked
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
      });

      if (!response.ok) return [];

      const json = await response.json();

      // 3. Fix: The items are located at json.Data.Items, not json.Items
      const items = json?.Data?.Items || [];

      // Filter only items created by this exact user
      return items.filter(entry => 
        entry.Item?.Creator?.Id === parsedUserId && 
        entry.Item?.Creator?.Type === 1 // 1 = User (not Group)
      );
    });

    // Wait for all three requests to finish
    const results = await Promise.all(fetchPromises);
    
    // Combine the 3 arrays into one flat array
    const allCreated = results.flat();

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
