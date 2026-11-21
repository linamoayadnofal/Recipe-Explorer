const express = require("express");
const router = express.Router();

const { searchGoogle } = require("../services/googleSearchService");

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const data = await searchGoogle(query.trim());

        const organicResults = data.organic_results || [];

        res.json({
            success: true,
            query: query.trim(),

            totalResults:
                data.search_information?.total_results || organicResults.length,

            results: organicResults.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;