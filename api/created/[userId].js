const { getUserCreatedItems } = require('../../assets');

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
    }

    try {
        const items = await getUserCreatedItems(userId);
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch" });
    }
}
