const express = require("express");
const router = express.Router();

const leadController = require("../controllers/lead.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


// CREATE LEAD
// Visitor
router.post(
  "/",
  authenticate,
  authorize(4),
  leadController.createLead
);


// GET ALL LEADS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  leadController.getAllLeads
);


// GET LEAD BY ID
// Admin / Organizer / Exhibitor / Visitor
router.get(
  "/:id",
  authenticate,
  authorize(1, 2, 3, 4),
  leadController.getLeadById
);


// UPDATE LEAD STATUS
// Exhibitor
router.put(
  "/:id/status",
  authenticate,
  authorize(3),
  leadController.updateLeadStatus
);


// UPDATE LEAD DETAILS
// Exhibitor
router.put(
  "/:id",
  authenticate,
  authorize(3),
  leadController.updateLead
);


module.exports = router;