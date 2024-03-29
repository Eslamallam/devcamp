const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");
const path = require("path");

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc     Get bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return new ErrorResponse(
      `No Bootcamp found for this id ${req.params.id}`,
      404
    );

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc     Create bootcamp
// @route    POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc     Update bootcamp
// @route    PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp)
    return new ErrorResponse(
      `No Bootcamp found for this id ${req.params.id}`,
      404
    );

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc     Delete bootcamp
// @route    DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return new ErrorResponse(
      `No Bootcamp found for this id ${req.params.id}`,
      404
    );

  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc     Get bootcamps within radius
// @route    GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // get lat/lng from geocoder
  const location = await geocoder.geocode(zipcode);

  const lat = location[0].latitude;
  const lng = location[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth radius = 3,963 miles | 6,378 km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc     Upload photo for bootcamp
// @route    PUT /api/v1/bootcamps/:id/photo
// @access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`No Bootcamp found for this id ${req.params.id}`, 404)
    );

  if (!req.files) return next(new ErrorResponse(`Please upload a file`, 400));

  const file = req.files.file;

  console.log(file);

  // make sure the file is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // check file size
  if (file.size > process.env.MAX_UPLOAD_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_UPLOAD_SIZE}`,
        400
      )
    );
  }

  //create a custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
