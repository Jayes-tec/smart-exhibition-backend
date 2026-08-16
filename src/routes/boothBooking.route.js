const express = require("express");
const router = express.Router();


const boothBookingController = require("../controllers/boothBooking.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize  = require("../middleware/role.middleware");


router.post(
    "/",
    authenticate,
    authorize(3), // Exhibitor
    boothBookingController.createBooking
);



router.get(
    "/",
    authenticate,
    authorize(1,2),                      //   ADMIN || ORGANIZER
    boothBookingController.getAllBookings
);



router.get(
    "/:id",
    authenticate,
    authorize(1,2),
    boothBookingController.getBookingById
);


//  here organizer will approve the booking  
router.put(
    "/:id/approve",
    authenticate,
    authorize(2), // Organizer
    boothBookingController.approveBooking
);


// here organizer will reject booking
router.put(
    "/:id/reject",
    authenticate,
    authorize(2),
    boothBookingController.rejectBooking
);


// here one can cancle booking
router.put(
    "/:id/cancel",
    authenticate,
    authorize(1,2,3),                              //   ADMIN  || ORGANIZER  || EXHIBITOR
    boothBookingController.cancelBooking
);


module.exports = router;