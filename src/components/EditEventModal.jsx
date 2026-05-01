import { AlertCircle, BookOpen, Calendar, Folder, Globe, LinkIcon, Lock, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const EditEventModal = ({
  isOpen,
  onClose,
  onSubmit,
  event,
  courses = {},
  folders = {},
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    accessType: 'free',
    status: true,
    courseId: '',
    courseName: '',
    folderId: '',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [bannerPreview, setBannerPreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (event) {

      setFormData({
        name: event.name || '',
        description: event.description || '',
        url: event.url || '',
        accessType: event.accessType || 'free',
        status: event.status === true || event.status === 'published',
        courseId: event.courseId || '',
        courseName: event.courseName || '',
        folderId: event.folderId || '',
        image: event.image || ''
      });

      setBannerPreview(event.image || '');
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }));
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setBannerPreview('');
    setImageFile(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data for API
      const submitData = {
        name: formData.name,
        description: formData.description,
        url: formData.url,
        accessType: formData.accessType,
        status: formData.status,
        courseId: formData.courseId,
        folderId: formData.folderId,
        courseName: formData.courseName
      };

      // If there's a new image file, add it to FormData
      if (imageFile) {
        const formDataToSend = new FormData();
        Object.keys(submitData).forEach(key => {
          formDataToSend.append(key, submitData[key]);
        });
        formDataToSend.append('image', imageFile);
        onSubmit(formDataToSend);
      } else {
        onSubmit(submitData);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      url: '',
      accessType: 'free',
      status: true,
      courseId: '',
      courseName: '',
      folderId: '',
      image: ''
    });
    setBannerPreview('');
    setImageFile(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full scrollbar-thin max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update event details below
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400`}
                placeholder="Enter event name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                placeholder="Enter event description..."
              />
            </div>

            {/* Stream URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stream URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${errors.url ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400`}
                  placeholder="https://example.com/stream"
                />
              </div>
              {errors.url && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.url}
                </p>
              )}
            </div>

            {/* Course and Folder Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-gray-700">
                    {formData.courseName || courses[formData.courseId] || 'Unknown Course'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-700">
                    {folders[formData.folderId] || 'Root Folder'}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Image
              </label>
              {!bannerPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: JPG, PNG, GIF (Max: 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={bannerPreview}
                    alt="Event preview"
                    className="max-h-32 rounded-lg border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {errors.image && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Access Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Type
              </label>
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="free"
                    checked={formData.accessType === 'free'}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <Globe className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="paid"
                    checked={formData.accessType === 'paid'}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Paid</span>
                </label>
              </div>
            </div>

            {/* Publish Status */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium">Publish event</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
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

export default EditEventModal;