import { useState, useEffect } from 'react';


import { handleCreateTopStudent, handleGetStream } from '../api/allApi';
import { Award, GraduationCap, Hash, RefreshCw, Save, User, UserPlus, Video, X } from 'lucide-react';

const AddTopStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [streams, setStreams] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    streamid: '',
    video_url: '',
    image: null
  });

  // Fetch streams on component mount
  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await handleGetStream();
      console.log('Streams response:', response);
      
      let streamsData = [];
      if (response?.success && response?.data) {
        streamsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        streamsData = response;
      } else if (response?.data) {
        streamsData = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      setStreams(streamsData);
    } catch (err) {
      console.error('Failed to fetch streams:', err);
      setError('Failed to load streams. Please refresh the page.');
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

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    // Validate file type
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
    
    setFormData(prev => ({ ...prev, image: file }));
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.streamid) {
      setError('Please select a stream');
      return false;
    }
    if (!formData.video.trim()) {
      setError('Video URL is required');
      return false;
    }
    // Validate video URL
    try {
      new URL(formData.video);
    } catch {
      setError('Please enter a valid video URL');
      return false;
    }
    if (!selectedFile) {
      setError('Avatar image is required');
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
      
      // Append fields
      submitData.append('name', formData.name.trim());
      submitData.append('streamid', formData.streamid);
      submitData.append('video_url', formData.video.trim());
      
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      // Log the data being sent
      console.log('Submitting student data:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      const response = await handleCreateTopStudent(submitData);
        setSuccess(true);
       
        setFormData({
          name: '',
          streamid: '',
          video_url: '',
          image: null
        });
        setAvatarPreview('');
        setSelectedFile(null);
      
    } catch (err) {
      console.error('Error creating top student:', err);
      
    } 
  };

  const handleReset = () => {
    setFormData({
      name: '',
      streamid: '',
      video_url: '',
      image: null
    });
    setAvatarPreview('');
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Add Top Student
          </h1>
          <p className="text-gray-600">
            Add outstanding students to the hall of fame
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
              <h2 className="text-lg font-semibold text-white">New Student Details</h2>
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
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                    title="Remove avatar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Avatar <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    required={!avatarPreview}
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
                placeholder="Enter student's full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                required
              />
            </div>

            {/* Stream Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stream/Course <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="streamid"
                  value={formData.streamid}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all appearance-none bg-white"
                  required
                >
                  <option value="">Select a stream</option>
                  {streams.map((stream) => (
                    <option key={stream.id} value={stream.stream_id || stream.id}>
                      {stream.name} (ID: {stream.stream_id || stream.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Video URL Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  name="video"
                  value={formData.video}
                  onChange={handleInputChange}
                  placeholder="https://example.com/video.mp4 or YouTube URL"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Supported: Direct video URLs or YouTube links
              </p>
            </div>

            {/* Preview Section */}
            {(formData.name || formData.streamid || formData.video || avatarPreview) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  Preview
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {formData.name || 'Student Name'}
                    </p>
                    {formData.streamid && (
                      <p className="text-xs text-gray-500">Stream ID: {formData.streamid}</p>
                    )}
                    {formData.video && (
                      <p className="text-xs text-indigo-600 truncate">{formData.video}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm flex items-center gap-1 disabled:opacity-50 min-w-[90px] justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTopStudent;