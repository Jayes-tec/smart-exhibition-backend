const db = require("../config/db");
const notificationService = require("./notification.service");


// =====================================================
// CREATE BOOKING
// =====================================================
const createBooking = async (data) => {
  const {
    booth_id,
    exhibitor_id,
    booking_date,
    userId,
  } = data;

  // 1. Validation
  if (!booth_id || !exhibitor_id || !booking_date) {
    return {
      success: false,
      statusCode: 400,
      message: "All fields are required",
    };
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 2. Check Booth Exists
    // Also find which exhibition the booth belongs to
    const [booth] = await connection.query(
      `SELECT
         b.booth_id,
         b.hall_id,
         b.status,
         h.exhibition_id
       FROM booths b
       JOIN halls h
         ON b.hall_id = h.hall_id
       WHERE b.booth_id = ?
       FOR UPDATE`,
      [booth_id]
    );

    if (booth.length === 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 404,
        message: "Booth not found",
      };
    }

    // 3. Check Booth Availability
    if (booth[0].status !== "Available") {
      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message: "Booth is not available",
      };
    }

    const exhibitionId = booth[0].exhibition_id;

    // 4. Check Exhibitor belongs to logged-in user
    const [exhibitor] = await connection.query(
      `SELECT exhibitor_id
       FROM exhibitors
       WHERE exhibitor_id = ?
       AND user_id = ?`,
      [exhibitor_id, userId]
    );

    if (exhibitor.length === 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 403,
        message:
          "You can only create booking for your own exhibitor account",
      };
    }

    // 5. Check Exhibitor already has an active booking
    // in the same exhibition
    const [existingExhibitionBooking] = await connection.query(
      `SELECT bb.booking_id
       FROM booth_bookings bb
       JOIN booths b
         ON bb.booth_id = b.booth_id
       JOIN halls h
         ON b.hall_id = h.hall_id
       WHERE bb.exhibitor_id = ?
       AND h.exhibition_id = ?
       AND bb.status IN ('Pending', 'Approved')
       FOR UPDATE`,
      [exhibitor_id, exhibitionId]
    );

    if (existingExhibitionBooking.length > 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 409,
        message:
          "Exhibitor already has an active booking for this exhibition",
      };
    }

    // 6. Check Booth already has an active booking
    const [existingBoothBooking] = await connection.query(
      `SELECT booking_id
       FROM booth_bookings
       WHERE booth_id = ?
       AND status IN ('Pending', 'Approved')
       FOR UPDATE`,
      [booth_id]
    );

    if (existingBoothBooking.length > 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 409,
        message: "Booth already has an active booking",
      };
    }

    // 7. Create Booking
    const [result] = await connection.query(
      `INSERT INTO booth_bookings
      (
        booth_id,
        exhibitor_id,
        booking_date
      )
      VALUES (?, ?, ?)`,
      [
        booth_id,
        exhibitor_id,
        booking_date,
      ]
    );

    await connection.commit();

    return {
      success: true,
      statusCode: 201,
      message: "Booth booked successfully",
      bookingId: result.insertId,
    };

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();
  }
};


// =====================================================
// GET ALL BOOKINGS
// =====================================================
const getAllBookings = async () => {

  const [rows] = await db.query(
    `SELECT
       bb.*,
       b.booth_number,
       e.company_name
     FROM booth_bookings bb
     JOIN booths b
       ON bb.booth_id = b.booth_id
     JOIN exhibitors e
       ON bb.exhibitor_id = e.exhibitor_id
     ORDER BY bb.created_at DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// =====================================================
// GET BOOKING BY ID
// =====================================================
const getBookingById = async (id) => {

  const [rows] = await db.query(
    `SELECT
       bb.*,
       b.booth_number,
       e.company_name
     FROM booth_bookings bb
     JOIN booths b
       ON bb.booth_id = b.booth_id
     JOIN exhibitors e
       ON bb.exhibitor_id = e.exhibitor_id
     WHERE bb.booking_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Booking not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// =====================================================
// APPROVE BOOKING
// =====================================================
const approveBooking = async (id) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // 1. Check Booking Exists
    const [booking] = await connection.query(
      `SELECT *
       FROM booth_bookings
       WHERE booking_id = ?
       FOR UPDATE`,
      [id]
    );

    if (booking.length === 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 404,
        message: "Booking not found",
      };
    }

    // 2. Check Current Booking Status
    if (booking[0].status === "Approved") {
      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message: "Booking already approved",
      };
    }

    if (
      booking[0].status === "Rejected" ||
      booking[0].status === "Cancelled"
    ) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message:
          `Cannot approve a ${booking[0].status.toLowerCase()} booking`,
      };
    }

    const boothId = booking[0].booth_id;
    const exhibitorId = booking[0].exhibitor_id;

    // 3. Find Exhibition Through Booth -> Hall -> Exhibition
    const [boothDetails] = await connection.query(
      `SELECT
         b.status,
         h.exhibition_id
       FROM booths b
       JOIN halls h
         ON b.hall_id = h.hall_id
       WHERE b.booth_id = ?
       FOR UPDATE`,
      [boothId]
    );

    if (boothDetails.length === 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 404,
        message: "Exhibition not found for this booth",
      };
    }

    // 4. Booth must still be available
    if (boothDetails[0].status !== "Available") {
      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message: "Booth is no longer available",
      };
    }

    const exhibitionId = boothDetails[0].exhibition_id;

    // 5. Check Existing Exhibition-Exhibitor Mapping
    // Pending / Approved = active registration
    const [existingMapping] = await connection.query(
      `SELECT
         exhibition_exhibitor_id,
         status
       FROM exhibition_exhibitors
       WHERE exhibition_id = ?
       AND exhibitor_id = ?
       AND status IN ('Pending', 'Approved')
       FOR UPDATE`,
      [
        exhibitionId,
        exhibitorId,
      ]
    );

    if (existingMapping.length > 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 409,
        message:
          "Exhibitor already has an active registration for this exhibition",
      };
    }

    // 6. Update Booking Status
    await connection.query(
      `UPDATE booth_bookings
       SET status = 'Approved'
       WHERE booking_id = ?`,
      [id]
    );

    // 7. Allocate Booth
    await connection.query(
      `UPDATE booths
       SET status = 'Allocated'
       WHERE booth_id = ?`,
      [boothId]
    );

    // 8. Create Exhibition-Exhibitor Mapping
    await connection.query(
      `INSERT INTO exhibition_exhibitors
      (
        exhibition_id,
        exhibitor_id,
        booth_id,
        registration_date,
        status
      )
      VALUES (?, ?, ?, ?, 'Approved')`,
      [
        exhibitionId,
        exhibitorId,
        boothId,
        booking[0].booking_date,
      ]
    );

    // 9. Commit Transaction
    await connection.commit();

    // 10. Send Notification
    // Notification failure should not affect approved booking
    try {

      const [exhibitorUser] = await db.query(
        `SELECT user_id
         FROM exhibitors
         WHERE exhibitor_id = ?`,
        [exhibitorId]
      );

      if (exhibitorUser.length > 0) {

        await notificationService.createNotification({
          user_id: exhibitorUser[0].user_id,
          title: "Booth Booking Approved",
          message:
            "Your booth booking has been approved successfully.",
        });

      }

    } catch (notificationError) {

      console.error(
        "Booking approved but notification failed:",
        notificationError
      );
    }

    return {
      success: true,
      statusCode: 200,
      message: "Booking approved successfully",
    };

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();
  }
};


// =====================================================
// REJECT BOOKING
// =====================================================
const rejectBooking = async (id) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // 1. Check Booking Exists
    const [booking] = await connection.query(
      `SELECT *
       FROM booth_bookings
       WHERE booking_id = ?
       FOR UPDATE`,
      [id]
    );

    if (booking.length === 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 404,
        message: "Booking not found",
      };
    }

    // 2. Only Pending booking can be rejected
    if (booking[0].status !== "Pending") {

      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message:
          `Cannot reject a ${booking[0].status.toLowerCase()} booking`,
      };
    }

    // 3. Update Booking Status
    await connection.query(
      `UPDATE booth_bookings
       SET status = 'Rejected'
       WHERE booking_id = ?`,
      [id]
    );

    // 4. Make Booth Available Again
    await connection.query(
      `UPDATE booths
       SET status = 'Available'
       WHERE booth_id = ?`,
      [booking[0].booth_id]
    );

    await connection.commit();

    // 5. Notify Exhibitor
    try {

      const [exhibitorUser] = await db.query(
        `SELECT user_id
         FROM exhibitors
         WHERE exhibitor_id = ?`,
        [booking[0].exhibitor_id]
      );

      if (exhibitorUser.length > 0) {

        await notificationService.createNotification({
          user_id: exhibitorUser[0].user_id,
          title: "Booth Booking Rejected",
          message:
            "Your booth booking has been rejected.",
        });

      }

    } catch (notificationError) {

      console.error(
        "Booking rejected but notification failed:",
        notificationError
      );
    }

    return {
      success: true,
      statusCode: 200,
      message: "Booking rejected successfully",
    };

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();
  }
};


// =====================================================
// CANCEL BOOKING
// =====================================================
const cancelBooking = async (id, user) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // 1. Check Booking Exists
    const [booking] = await connection.query(
      `SELECT *
       FROM booth_bookings
       WHERE booking_id = ?
       FOR UPDATE`,
      [id]
    );

    if (booking.length === 0) {
      await connection.rollback();

      return {
        success: false,
        statusCode: 404,
        message: "Booking not found",
      };
    }

    // 2. Exhibitor can cancel only their own booking
    if (user.roleId === 3) {

      const [exhibitor] = await connection.query(
        `SELECT exhibitor_id
         FROM exhibitors
         WHERE user_id = ?`,
        [user.userId]
      );

      if (
        exhibitor.length === 0 ||
        exhibitor[0].exhibitor_id !== booking[0].exhibitor_id
      ) {

        await connection.rollback();

        return {
          success: false,
          statusCode: 403,
          message: "You can only cancel your own booking",
        };
      }
    }

    // 3. Already Cancelled
    if (booking[0].status === "Cancelled") {

      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message: "Booking already cancelled",
      };
    }

    // 4. Rejected booking cannot be cancelled
    if (booking[0].status === "Rejected") {

      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message: "Rejected booking cannot be cancelled",
      };
    }

    // Only Pending / Approved booking can be cancelled
    if (
      booking[0].status !== "Pending" &&
      booking[0].status !== "Approved"
    ) {

      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message:
          `Cannot cancel a ${booking[0].status.toLowerCase()} booking`,
      };
    }

    // 5. Update Booking Status
    await connection.query(
      `UPDATE booth_bookings
       SET status = 'Cancelled'
       WHERE booking_id = ?`,
      [id]
    );

    // 6. Release Booth
    await connection.query(
      `UPDATE booths
       SET status = 'Available'
       WHERE booth_id = ?`,
      [booking[0].booth_id]
    );

    // 7. If Approved booking is cancelled,
    // release Exhibition-Exhibitor registration
    if (booking[0].status === "Approved") {

      await connection.query(
        `UPDATE exhibition_exhibitors
         SET status = 'Rejected'
         WHERE booth_id = ?
         AND exhibitor_id = ?
         AND status = 'Approved'`,
        [
          booking[0].booth_id,
          booking[0].exhibitor_id,
        ]
      );
    }

    await connection.commit();

    return {
      success: true,
      statusCode: 200,
      message: "Booking cancelled successfully",
    };

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();
  }
};


module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
};