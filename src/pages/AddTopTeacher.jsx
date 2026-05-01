import { useState, useEffect } from 'react';
import { handleGetStream, handleCreateTopTeacher } from '../api/allApi';
import { Award, BookOpen, RefreshCw, Save, User, UserPlus, X, CheckCircle, AlertCircle } from 'lucide-react';

const AddTopTeacher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [streams, setStreams] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    about: '',
    streamid: '' // Empty string means no stream selected
  });

  // Fetch streams on component mount
  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await handleGetStream();

      let streamsData = [];

      if (Array.isArray(response)) {
        streamsData = response;
      } else if (response?.success && response?.data) {
        streamsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (response?.data) {
        streamsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (response?.streams && Array.isArray(response.streams)) {
        streamsData = response.streams;
      }

      // Ensure each stream has proper id and name
      const formattedStreams = streamsData.map(stream => ({
        id: stream.id || stream._id,
        name: stream.name || stream.streamName || 'Unnamed Stream'
      }));

      setStreams(formattedStreams);

    } catch (err) {
      console.error('Failed to fetch streams:', err);
      setError('Failed to load streams');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    setSelectedFile(null);
    const fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.about.trim()) {
      setError('About section is required');
      return false;
    }
    if (!avatarPreview && !selectedFile) {
      setError('Teacher avatar is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const submitData = new FormData();

      submitData.append('name', formData.name.trim());
      submitData.append('about', formData.about.trim());

      // Handle streamid - only send if selected and valid
      if (formData.streamid && formData.streamid !== '') {
        submitData.append('streamid', formData.streamid);
      }

      if (selectedFile) {
        submitData.append('image', selectedFile);
      }


      const response = await handleCreateTopTeacher(submitData);


      // Check for successful response
      if (response && (response.success === true || response.status === 200 || response.data)) {
        setSuccess(true);
        setFormData({
          name: '',
          about: '',
          streamid: ''
        });
        setAvatarPreview('');
        setSelectedFile(null);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(response?.message || 'Failed to create top teacher');
      }
    } catch (err) {
      console.error('Error creating top teacher:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create top teacher';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      about: '',
      streamid: ''
    });
    setAvatarPreview('');
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    const fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Award className="w-8 h-8 text-indigo-600" />
            Add Top Teacher
          </h1>
          <p className="text-gray-600">
            Add outstanding teachers to the hall of fame
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Teacher Details</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-indigo-400" />
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                    title="Remove avatar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Avatar <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-500 transition-colors">
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: JPG, PNG, GIF (Max: 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter teacher's full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                required
              />
            </div>

            {/* Stream Selection - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stream/Course <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="streamid"
                  value={formData.streamid}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all appearance-none bg-white"
                >
                  <option value="">No stream selected</option>
                  {streams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.streamid && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Associated with selected stream
                </p>
              )}
              {streams.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No streams available. You can still add a teacher without selecting a stream.
                </p>
              )}
            </div>

            {/* About Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About <span className="text-red-500">*</span>
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows="4"
                placeholder="Write a brief description about the teacher..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.about.length}/500 characters
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px] justify-center shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Teacher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            About Top Teachers:
          </h3>
          <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
            <li>Top teachers are featured on the homepage</li>
            <li>Add a clear, professional-looking avatar</li>
            <li>Write a compelling about section highlighting achievements</li>
            <li>Optionally associate with a specific stream/course</li>
          </ul>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddTopTeacher;