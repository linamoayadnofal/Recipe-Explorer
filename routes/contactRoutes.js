const express = require("express");
const { appendFile } = require("node:fs/promises");
const path = require("node:path");

const router = express.Router();
const inbox = path.join(__dirname, "../data/contact-messages.jsonl");

router.post("/", async (req, res) => {
    const fields = ["name", "email", "message"];
    if (!fields.every(field => typeof req.body?.[field] === "string")) {
        return res.status(400).json({ message: "Complete all three fields." });
    }

    const [name, email, message] = fields.map(field => req.body[field].trim());
    if (!name || name.length > 100 ||
        email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !message || message.length > 3000) {
        return res.status(400).json({ message: "Enter a valid name, email, and message." });
    }

    const subject = req.body.subject;
    if (subject !== undefined && (typeof subject !== "string" || !subject.trim() || subject.trim().length > 100)) {
        return res.status(400).json({ message: "Enter a valid subject." });
    }

    try {
        const entry = { name, email, subject: subject?.trim(), message, receivedAt: new Date().toISOString() };
        await appendFile(inbox, JSON.stringify(entry) + "\n", { mode: 0o600 });
        return res.status(201).json({ message: "Your message was received." });
    } catch {
        return res.status(500).json({ message: "Unable to save your message. Please try again." });
    }
});

module.exports = router;
