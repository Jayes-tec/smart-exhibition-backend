const boothBookingService = require("../services/boothBooking.service");

const createBooking = async (req, res) => {
  try {

    const data = {
      ...req.body,
      userId: req.user.userId
    };

    const result = await boothBookingService.createBooking(data);

    res.status(result.statusCode || 201).json(result);

  } catch (error) {

    console.error("Create Booking Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getAllBookings = async (req,res,next) => {
    try{
        const result = await boothBookingService.getAllBookings();
          res.status(result.statusCode || 200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        }); 

    }
}

const getBookingById = async (req,res,next) =>{
    try{
        const result = await boothBookingService.getBookingById(req.params.id);
         res.status(result.statusCode || 200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
    
}

const approveBooking = async (req,res,next) => {
    try{
        const result = await boothBookingService.approveBooking(req.params.id);
         res.status(result.statusCode || 200).json(result);
}
catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }  
}

const rejectBooking = async (req,res,next) => {
    try{
        const result = await boothBookingService.rejectBooking(req.params.id);
            res.status(result.statusCode || 200).json(result);
     } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }  
}   

const cancelBooking = async (req,res,next) => {
    try{
        const result = await boothBookingService.cancelBooking(req.params.id,req.user);
        res.status(result.statusCode || 200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    approveBooking,
    rejectBooking,
    cancelBooking

}