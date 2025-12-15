import React, { useState } from "react";
import axios from "axios";
import { Upload, X, Loader } from "lucide-react";
import toast from "react-hot-toast";

const ImageUpload = ({ onUpload, maxFiles = 1, existingImages = [] }) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState(existingImages);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      if (maxFiles === 1) {
        formData.append("image", files[0]);
      } else {
        files.forEach((file) => {
          formData.append("images", file);
        });
      }

      const token = localStorage.getItem("token");
      const endpoint = maxFiles === 1 ? "/single" : "/multiple";

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (maxFiles === 1) {
        const newImage = response.data.url;
        setImages([newImage]);
        setPreviews([newImage]);
        if (onUpload) onUpload(newImage);
      } else {
        const newImages = response.data.images.map((img) => img.url);
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        setPreviews(updatedImages);
        if (onUpload) onUpload(updatedImages);
      }

      toast.success("Image(s) uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image(s)");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    if (onUpload) onUpload(maxFiles === 1 ? "" : updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {images.length < maxFiles && (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <Loader className="w-10 h-10 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload{" "}
                    {maxFiles > 1 ? `(${images.length}/${maxFiles})` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple={maxFiles > 1}
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
