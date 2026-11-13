
const express = require("express");
const router = express.Router();

const {
    searchRecipes,
    getRecipeById,
    filterByIngredient,
    getRandomRecipe
} = require("../services/mealService");

// Search recipes by name
router.get("/search", async (req, res) => {
    try {
        const name = req.query.name;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Recipe name is required"
            });
        }

        const data = await searchRecipes(name);
        res.json(data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Filter recipes by ingredient
router.get("/ingredient/:ingredient", async (req, res) => {
    try {
        const data = await filterByIngredient(req.params.ingredient);
        res.json(data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get a random recipe
router.get("/random", async (req, res) => {
    try {
        const data = await getRandomRecipe();
        res.json(data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get recipe details by ID
router.get("/:id", async (req, res) => {
    try {
        const data = await getRecipeById(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
