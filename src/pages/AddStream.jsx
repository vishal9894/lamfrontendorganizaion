import { useState, useEffect } from "react";
import { handleCreateStream, handleGetSuperStream } from "../api/allApi";
import { 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  FileText, 
  FolderTree, 
  Info, 
  Layers, 
  Save, 
  Upload, 
  X, 
  Zap,
  Image 
} from "lucide-react";

const AddStream = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    superstreamId: "",
  });

  const [superStreams, setSuperStreams] = useState([]);
  const [loadingSuperStreams, setLoadingSuperStreams] = useState(true);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    fetchSuperStreams();
  }, []);

  const fetchSuperStreams = async () => {
    setLoadingSuperStreams(true);
    try {
      const data = await handleGetSuperStream();
      // Ensure data is an array and transform if needed
      let streamsArray = [];
      
      if (Array.isArray(data)) {
        streamsArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        streamsArray = data.data;
      } else if (data?.superStreams && Array.isArray(data.superStreams)) {
        streamsArray = data.superStreams;
      }
      
      // Transform each super stream to ensure name is a string
      const transformedStreams = streamsArray.map(stream => ({
        ...stream,
        id: stream.id || stream._id,
        name: typeof stream.name === 'string' 
          ? stream.name 
          : stream.name?.name || stream.name?.value || String(stream.name) || 'Unnamed'
      }));
      
      setSuperStreams(transformedStreams);
    } catch (error) {
      console.error("Error fetching super streams:", error);
      setError("Failed to load super streams");
    } finally {
      setLoadingSuperStreams(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name") {
      setNameError(null);
    }
    if (name === "superstreamId") {
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setFile(selectedFile);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    const input = document.getElementById("stream-image");
    if (input) input.value = "";
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", superstreamId: "" });
    setFile(null);
    setFilePreview(null);
    setError(null);
    setNameError(null);
  };

  // Helper function to safely get name as string
  const getStreamName = (stream) => {
    if (!stream) return '';
    if (typeof stream.name === 'string') return stream.name;
    if (stream.name?.name) return stream.name.name;
    if (stream.name?.value) return stream.name.value;
    return String(stream.name) || 'Unnamed';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Stream name is required");
      return;
    }

    if (!formData.superstreamId) {
      setError("Please select a super stream");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setNameError(null);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description?.trim() || "");
      formDataToSend.append("superstreamId", formData.superstreamId);

      if (file) {
        formDataToSend.append("image", file);
      }

      const response = await handleCreateStream(formDataToSend);

      // Check for successful response
      if (response && (response.success === true || response.status === 200 || response.data)) {
        setShowSuccess(true);
        // Reset form after successful creation
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 3000);
      } else {
        // Handle duplicate key error
        if (
          response?.error?.includes("duplicate key") ||
          response?.message?.includes("already exists") ||
          response?.error?.includes("already exists")
        ) {
          setNameError(
            `Stream name "${formData.name}" already exists. Please choose a different name.`
          );
        } else {
          setError(response?.message || response?.error || "Failed to create stream");
        }
      }
    } catch (err) {
      console.error("Failed to create stream:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create stream";
      
      if (
        errorMessage?.includes("duplicate key") ||
        errorMessage?.includes("already exists")
      ) {
        setNameError(
          `Stream name "${formData.name}" already exists. Please choose a different name.`
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find selected super stream safely
  const selectedSuperStream = superStreams.find(
    (s) => s.id === formData.superstreamId
  );
  
  // Safely get selected stream name as string
  const selectedStreamName = selectedSuperStream ? getStreamName(selectedSuperStream) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-4">
            <Layers className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create New Stream
          </h1>
          <p className="text-gray-600">
            Add a new stream under a super stream to organize your content
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">
                Stream Created Successfully!
              </h3>
              <p className="text-sm text-emerald-600">
                Your new stream "{formData.name}" has been added to {selectedStreamName}
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="p-1 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Info className="w-5 h-5" />
              Stream Information
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Fill in the details below to create a new stream
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Super Stream Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                Super Stream <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="superstreamId"
                  value={formData.superstreamId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-11 pr-10 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none bg-white"
                  required
                  disabled={loadingSuperStreams}
                >
                  <option value="">Select a super stream</option>
                  {superStreams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {getStreamName(stream)}
                    </option>
                  ))}
                </select>
                <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {loadingSuperStreams && (
                <p className="text-xs text-gray-500">Loading super streams...</p>
              )}

              {superStreams.length === 0 && !loadingSuperStreams && (
                <p className="text-xs text-red-500">
                  No super streams available. Please create a super stream first.
                </p>
              )}

              {selectedSuperStream && !loadingSuperStreams && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Creating stream under: {selectedStreamName}
                </p>
              )}
            </div>

            {/* Stream Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                Stream Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Web Development, Data Science, Digital Marketing"
                  className={`w-full px-4 py-3 pl-11 rounded-xl border transition-all ${
                    nameError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                  } focus:ring-2`}
                  required
                />
                <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {nameError && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {nameError}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Choose a clear, descriptive name for your stream
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Description
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this stream offers, target audience, and key benefits..."
                  rows="4"
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                />
                <FileText className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Provide a detailed description to help students understand
              </p>
            </div>

            {/* Stream Image */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Image className="w-4 h-4 text-indigo-600" />
                Stream Image
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-500 transition-colors">
                {filePreview ? (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-center mt-2 text-gray-500">
                      {file?.name} ({(file?.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                ) : (
                  <label className="cursor-pointer block text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      Click to upload stream image
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <input
                      id="stream-image"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.name.trim() ||
                  !formData.superstreamId ||
                  nameError
                }
                className={`flex-1 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isSubmitting ||
                  !formData.name.trim() ||
                  !formData.superstreamId ||
                  nameError
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Stream
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              <span className="text-red-500">*</span> Required fields
            </p>
          </form>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Tips for creating a great stream:
          </h3>
          <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
            <li>First select a Super Stream to organize your content</li>
            <li>Use clear, searchable stream names</li>
            <li>Add a detailed description to attract students</li>
            <li>Upload an eye-catching image that represents the stream</li>
            <li>Keep the name concise but descriptive</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddStream;