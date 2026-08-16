const exhibitionService = require("../services/exhibition.service");

const createExhibition = async (req, res, next) => {
  try {
    const result = await exhibitionService.createExhibition(
      { ...req.body, banner: req.file ? `/uploads/exhibitions/${req.file.filename}` : undefined },
      req.user.userId,
    );

    res.status(result.statusCode || 201).json(result);

  } catch (e) {

    console.log(e);

    res.status(500).json({
      success: false,
      message: e.message,
    });

  }
};


const getAllExhibitions = async (req, res, next) => {
  try {

    const result = await exhibitionService.getAllExhibitions();

    res.status(result.statusCode || 200).json(result);

  } catch (e) {

    res.status(500).json({
      success: false,
      message: e.message,
    });

  }
};


const getExhibitionById = async (req, res, next) => {
  try {

    const result = await exhibitionService.getExhibitionById(
      req.params.id
    );

    res.status(result.statusCode || 200).json(result);

  } catch (e) {

    res.status(500).json({
      success: false,
      message: e.message,
    });

  }
};


// UPDATE EXHIBITION

const updateExhibition = async (req, res, next) => {
  try {

    const result = await exhibitionService.updateExhibition(
      req.params.id,
      { ...req.body, banner: req.file ? `/uploads/exhibitions/${req.file.filename}` : undefined },
      req.user.userId
    );

    res.status(result.statusCode || 200).json(result);

  } catch (e) {

    res.status(500).json({
      success: false,
      message: e.message,
    });

  }
};


const deleteExhibition = async (req, res) => {

  try {

    const result = await exhibitionService.deleteExhibition(
      req.params.id,
      req.user.userId
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


module.exports = {
  createExhibition,
  getAllExhibitions,
  getExhibitionById,
  updateExhibition,
  deleteExhibition
};