const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload options by file type
const uploadOptions = {
  audio: {
    resource_type: "video", // Cloudinary treats audio as video
    folder: "sanskaar/audio",
    allowed_formats: ["mp3", "wav", "m4a", "ogg"],
  },
  video: {
    resource_type: "video",
    folder: "sanskaar/video",
    allowed_formats: ["mp4", "webm", "mov"],
  },
  image: {
    resource_type: "image",
    folder: "sanskaar/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
};

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path or base64 data
 * @param {string} type - 'audio' | 'video' | 'image'
 * @param {string} customFolder - Optional custom folder
 * @returns {Promise<{url: string, public_id: string, duration?: number}>}
 */
const uploadToCloud = async (filePath, type = "image", customFolder = null) => {
  try {
    const options = {
      ...uploadOptions[type],
      folder: customFolder || uploadOptions[type].folder,
    };

    const result = await cloudinary.uploader.upload(filePath, options);

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration || null,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload from buffer/stream
 * @param {Buffer} buffer - File buffer
 * @param {string} type - 'audio' | 'video' | 'image'
 * @param {string} customFolder - Optional custom folder
 * @returns {Promise}
 */
const uploadFromBuffer = (buffer, type = "image", customFolder = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      ...uploadOptions[type],
      folder: customFolder || uploadOptions[type].folder,
    };

    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration || null,
            format: result.format,
          });
        }
      })
      .end(buffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @param {string} type - 'audio' | 'video' | 'image'
 * @returns {Promise}
 */
const deleteFromCloud = async (publicId, type = "image") => {
  try {
    const resourceType = type === "audio" ? "video" : type;
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return {
      success: result.result === "ok",
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate signed URL for private assets
 * @param {string} publicId - Cloudinary public_id
 * @param {object} options - Transformation options
 * @returns {string}
 */
const getSignedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    sign_url: true,
    type: "authenticated",
    ...options,
  });
};

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public_id
 * @param {object} transforms - Transformation options
 * @returns {string}
 */
const getOptimizedImageUrl = (publicId, transforms = {}) => {
  const defaultTransforms = {
    fetch_format: "auto",
    quality: "auto",
    ...transforms,
  };
  return cloudinary.url(publicId, defaultTransforms);
};

module.exports = {
  cloudinary,
  uploadToCloud,
  uploadFromBuffer,
  deleteFromCloud,
  getSignedUrl,
  getOptimizedImageUrl,
};
