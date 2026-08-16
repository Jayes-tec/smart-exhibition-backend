const boothService = require("../services/booth.service");


const createBooth = async (req, res) => {
    try {
        const result = await boothService.createBooth(req.body);
        res.status(result.statusCode || 201).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getAllBooths = async (req, res) => {
    try {
        const result = await boothService.getAllBooths();
        res.status(result.statusCode || 200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getBoothById = async (req, res) => {
    try {
        const result = await boothService.getBoothById(req.params.id);
        res.status(result.statusCode || 200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const updateBooth = async (req, res) => {
    try {
        const result = await boothService.updateBooth(
            req.params.id,
            req.body
        );

        res.status(result.statusCode || 200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const deleteBooth = async (req, res) => {
    try {
        const result = await boothService.deleteBooth(req.params.id);

        res.status(result.statusCode || 200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createBooth,
    getAllBooths,
    getBoothById,
    updateBooth,
    deleteBooth
};