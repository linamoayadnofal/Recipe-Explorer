
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const recipeRoutes = require("./routes/recipeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const googleRoutes = require("./routes/googleRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/google", googleRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Recipe Explorer API is running!"
    });
});

app.listen(PORT, () => {
    console.log(`Recipe Explorer is running at http://localhost:${PORT}`);
});

