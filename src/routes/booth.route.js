const express = require("express");
const router = express.Router();

const boothController = require("../controllers/booth.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post(
    "/",
    authenticate,
    authorize(1, 2),
    boothController.createBooth
);

router.get(
    "/",
    authenticate,
    boothController.getAllBooths
);

router.get(
    "/:id",
    authenticate,
    boothController.getBoothById
);


router.put(
    "/:id",
    authenticate,
    authorize(1, 2),
    boothController.updateBooth
);


router.delete(
    "/:id",
    authenticate,
    authorize(1),
    boothController.deleteBooth
);

module.exports = router;