const { fetchTShirts } = require('../lib/roblox');

module.exports = async (req, res) => {
  const { userId, cursor } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    const data = await fetchTShirts(userId, cursor);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching tshirts:", error);
    res.status(500).json({ error: error.message });
  }
};
