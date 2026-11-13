
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");

router.get("/", (req, res) => {
    try {
        const xmlPath = path.join(__dirname, "../data/categories.xml");
        const xmlData = fs.readFileSync(xmlPath, "utf8");

        const parser = new XMLParser();
        const result = parser.parse(xmlData);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not load categories"
        });
    }
});

module.exports = router;
