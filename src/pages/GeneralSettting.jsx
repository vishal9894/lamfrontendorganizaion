import { useState, useEffect } from 'react';


import { 
  handleGetAllSettings, 
  handleCreateSetting,
  handleGetRoutingAccount,
  handleCreateRouteSetting,
  handleDeleteRoutingAccount
} from '../api/allApi';

const GeneralSetting = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Routing accounts state
  const [routingAccounts, setRoutingAccounts] = useState([]);
  const [showAddRouting, setShowAddRouting] = useState(false);
  const [routingForm, setRoutingForm] = useState({
    account_id: '',
    percentage: 0,
    status: true
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state for all settings
  const [formData, setFormData] = useState({
    // Application Features - Toggles
    otp_verification: false,
    video_download: false,
    pdf_download: false,
    group_joining: false,
    buy_or_upgrade: false,
    test_reattempts: false,

    // Content Order
    app_content_order: 'ascending',
    web_content_order: 'ascending',

    // Application Details
    application_package: '',
    application_version: '',

    // Upload Size Limits (in MB)
    max_image_size: 5,
    max_pdf_size: 10,

    // Notification Settings
    onesignal_app_id: '',
    onesignal_auth_key: '',

    // Payment & Security
    razorpay_auth: '',
    login_attempts_limit: 3,
    support_phone: '',
    number_flashing_time: 5,

    // Social Media Links
    telegram_link: '',
    facebook_link: '',
    youtube_link: '',
    board_result_link: '',
    ytdl_link: '',

    // New nested structure from API
    social_media: {
      youtube: '',
      facebook: '',
      whatsapp: '',
      instagram: ''
    },
    features: {
      live_class: false,
      pdf_download: false,
      video_download: false
    }
  });

  useEffect(() => {
    fetchSettings();
    fetchRoutingAccounts();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await handleGetAllSettings();
      console.log('Settings response:', response);
      
      if (response?.success && response?.data) {
        const settingsData = response.data;
        
        // Get the main settings object (prefer all_settings if it exists)
        const mainSettings = settingsData.all_settings || settingsData;
        
        setFormData(prev => ({
          ...prev,
          // Flat settings - check both mainSettings and root settingsData
          otp_verification: mainSettings.otp_verification === true || mainSettings.otp_verification === 'true' || settingsData.otp_verification === true || false,
          video_download: mainSettings.video_download === true || mainSettings.video_download === 'true' || settingsData.video_download === true || false,
          pdf_download: mainSettings.pdf_download === true || mainSettings.pdf_download === 'true' || settingsData.pdf_download === true || false,
          group_joining: mainSettings.group_joining === true || mainSettings.group_joining === 'true' || settingsData.group_joining === true || false,
          buy_or_upgrade: mainSettings.buy_or_upgrade === true || mainSettings.buy_or_upgrade === 'true' || settingsData.buy_or_upgrade === true || false,
          test_reattempts: mainSettings.test_reattempts === true || mainSettings.test_reattempts === 'true' || settingsData.test_reattempts === true || false,
          
          // Content Order
          app_content_order: mainSettings.app_content_order || settingsData.app_content_order || 'ascending',
          web_content_order: mainSettings.web_content_order || settingsData.web_content_order || 'ascending',
          
          // Application Details
          application_package: mainSettings.application_package || settingsData.application_package || '',
          application_version: mainSettings.application_version || settingsData.application_version || '',
          
          // Upload Size Limits
          max_image_size: parseInt(mainSettings.max_image_size) || parseInt(settingsData.max_image_size) || 5,
          max_pdf_size: parseInt(mainSettings.max_pdf_size) || parseInt(settingsData.max_pdf_size) || 10,
          
          // Notification Settings
          onesignal_app_id: mainSettings.onesignal_app_id || settingsData.onesignal_app_id || '',
          onesignal_auth_key: mainSettings.onesignal_auth_key || settingsData.onesignal_auth_key || '',
          
          // Payment & Security
          razorpay_auth: mainSettings.razorpay_auth || settingsData.razorpay_auth || '',
          login_attempts_limit: parseInt(mainSettings.login_attempts_limit) || parseInt(settingsData.login_attempts_limit) || 3,
          support_phone: mainSettings.support_phone || settingsData.support_phone || '',
          number_flashing_time: parseInt(mainSettings.number_flashing_time) || parseInt(settingsData.number_flashing_time) || 5,
          
          // Social Media Links (Legacy)
          telegram_link: mainSettings.telegram_link || settingsData.telegram_link || '',
          facebook_link: mainSettings.facebook_link || settingsData.facebook_link || '',
          youtube_link: mainSettings.youtube_link || settingsData.youtube_link || '',
          board_result_link: mainSettings.board_result_link || settingsData.board_result_link || '',
          ytdl_link: mainSettings.ytdl_link || settingsData.ytdl_link || '',
          
          // Nested objects - prefer from mainSettings, fallback to settingsData
          social_media: {
            ...prev.social_media,
            ...(mainSettings.social_media || settingsData.social_media || {})
          },
          features: {
            ...prev.features,
            ...(mainSettings.features || settingsData.features || {})
          }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutingAccounts = async () => {
    try {
      const response = await handleGetRoutingAccount();
      console.log('Routing accounts:', response);
      
      if (response?.success && response?.data) {
        setRoutingAccounts(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch routing accounts:', err);
    }
  };

  const handleToggleChange = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const handleRoutingInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoutingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddRoutingAccount = async () => {
    if (!routingForm.account_id) {
      setError('Account ID is required');
      return;
    }
    if (!routingForm.percentage || routingForm.percentage <= 0) {
      setError('Percentage must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      const response = await handleCreateRouteSetting({
        account_id: routingForm.account_id,
        percentage: parseInt(routingForm.percentage),
        status: routingForm.status
      });

      if (response?.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setShowAddRouting(false);
        setRoutingForm({ account_id: '', percentage: 0, status: true });
        fetchRoutingAccounts();
      } else {
        setError(response?.message || 'Failed to add routing account');
      }
    } catch (err) {
      console.error('Error adding routing account:', err);
      setError(err.message || 'Failed to add routing account');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoutingClick = (id, accountId) => {
    setDeleteModal({ show: true, id, name: accountId });
  };

  const handleDeleteRoutingConfirm = async () => {
    if (!deleteModal.id) return;
    
    setDeleteLoading(true);
    try {
      const response = await handleDeleteRoutingAccount(deleteModal.id);
      
      if (response?.success) {
        await fetchRoutingAccounts();
        setDeleteModal({ show: false, id: null, name: '' });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response?.message || 'Failed to delete routing account');
      }
    } catch (err) {
      console.error('Failed to delete routing account:', err);
      setError(err.message || 'Failed to delete routing account');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Create a single settings object to save
  const createSettingsPayload = () => {
    // Create the full settings object
    const settings = {
      // Flat settings
      otp_verification: formData.otp_verification,
      video_download: formData.video_download,
      pdf_download: formData.pdf_download,
      group_joining: formData.group_joining,
      buy_or_upgrade: formData.buy_or_upgrade,
      test_reattempts: formData.test_reattempts,
      app_content_order: formData.app_content_order,
      web_content_order: formData.web_content_order,
      application_package: formData.application_package,
      application_version: formData.application_version,
      max_image_size: formData.max_image_size,
      max_pdf_size: formData.max_pdf_size,
      onesignal_app_id: formData.onesignal_app_id,
      onesignal_auth_key: formData.onesignal_auth_key,
      razorpay_auth: formData.razorpay_auth,
      login_attempts_limit: formData.login_attempts_limit,
      support_phone: formData.support_phone,
      number_flashing_time: formData.number_flashing_time,
      telegram_link: formData.telegram_link,
      facebook_link: formData.facebook_link,
      youtube_link: formData.youtube_link,
      board_result_link: formData.board_result_link,
      ytdl_link: formData.ytdl_link,
      
      // Nested objects
      social_media: formData.social_media,
      features: formData.features
    };
    
    // Return as all_settings to match your API structure
    return {
      all_settings: settings
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Create a single settings object
      const settingsPayload = createSettingsPayload();
      
      // Save all settings in one API call
      const response = await handleCreateSetting({
        setting_key: 'all_settings',
        setting_value: JSON.stringify(settingsPayload),
        description: 'All application settings'
      });

      await fetchSettings();
      
      if (response?.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response?.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Settings className="w-8 h-8 text-indigo-600" />
                General Settings
              </h1>
              <p className="text-gray-600">
                Configure application settings and preferences
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSettings}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('routing')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'routing'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Routing Accounts
            </button>
          </div>
        </div>

       
        {/* Tab Content */}
        {activeTab === 'general' ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Application Features */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    Application Features
                  </h2>
                  <div className="space-y-3">
                    <ToggleItem
                      label="OTP Verification"
                      checked={formData.otp_verification}
                      onChange={() => handleToggleChange('otp_verification')}
                    />
                    <ToggleItem
                      label="Video Download"
                      checked={formData.video_download}
                      onChange={() => handleToggleChange('video_download')}
                    />
                    <ToggleItem
                      label="PDF Download"
                      checked={formData.pdf_download}
                      onChange={() => handleToggleChange('pdf_download')}
                    />
                    <ToggleItem
                      label="Group Joining"
                      checked={formData.group_joining}
                      onChange={() => handleToggleChange('group_joining')}
                    />
                    <ToggleItem
                      label="Buy or Upgrade"
                      checked={formData.buy_or_upgrade}
                      onChange={() => handleToggleChange('buy_or_upgrade')}
                    />
                    <ToggleItem
                      label="Test Reattempts"
                      checked={formData.test_reattempts}
                      onChange={() => handleToggleChange('test_reattempts')}
                    />
                  </div>
                </div>

                {/* Social Media Links (New) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    Social Media Links
                  </h2>
                  <div className="space-y-4">
                    <SocialInput
                      label="YouTube"
                      value={formData.social_media.youtube}
                      onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/@channel"
                    />
                    <SocialInput
                      label="Facebook"
                      value={formData.social_media.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/page"
                    />
                    <SocialInput
                      label="WhatsApp"
                      value={formData.social_media.whatsapp}
                      onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <SocialInput
                      label="Instagram"
                      value={formData.social_media.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>

                {/* Features (New) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    Features
                  </h2>
                  <div className="space-y-3">
                    <ToggleItem
                      label="Live Class"
                      checked={formData.features.live_class}
                      onChange={() => handleFeatureToggle('live_class')}
                    />
                    <ToggleItem
                      label="PDF Download"
                      checked={formData.features.pdf_download}
                      onChange={() => handleFeatureToggle('pdf_download')}
                    />
                    <ToggleItem
                      label="Video Download"
                      checked={formData.features.video_download}
                      onChange={() => handleFeatureToggle('video_download')}
                    />
                  </div>
                </div>

                {/* Content Arrangement */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5 text-indigo-600" />
                    Content Arrangement
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        App Content Order
                      </label>
                      <select
                        value={formData.app_content_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, app_content_order: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      >
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Web Content Order
                      </label>
                      <select
                        value={formData.web_content_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, web_content_order: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      >
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Application Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Package
                      </label>
                      <input
                        type="text"
                        value={formData.application_package}
                        onChange={(e) => setFormData(prev => ({ ...prev, application_package: e.target.value }))}
                        placeholder="com.example.app"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Version
                      </label>
                      <input
                        type="text"
                        value={formData.application_version}
                        onChange={(e) => setFormData(prev => ({ ...prev, application_version: e.target.value }))}
                        placeholder="1.0.0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Size Limits */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-indigo-600" />
                    Upload Size Limits
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Image Size (MB)
                      </label>
                      <input
                        type="number"
                        value={formData.max_image_size}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_image_size: parseInt(e.target.value) || 5 }))}
                        min="1"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max PDF Size (MB)
                      </label>
                      <input
                        type="number"
                        value={formData.max_pdf_size}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_pdf_size: parseInt(e.target.value) || 10 }))}
                        min="1"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Notification Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Notification Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OneSignal App ID
                      </label>
                      <input
                        type="text"
                        value={formData.onesignal_app_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, onesignal_app_id: e.target.value }))}
                        placeholder="Enter OneSignal App ID"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OneSignal Auth Key
                      </label>
                      <input
                        type="text"
                        value={formData.onesignal_auth_key}
                        onChange={(e) => setFormData(prev => ({ ...prev, onesignal_auth_key: e.target.value }))}
                        placeholder="Enter OneSignal Auth Key"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment & Security */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Payment & Security
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razorpay Auth
                      </label>
                      <input
                        type="text"
                        value={formData.razorpay_auth}
                        onChange={(e) => setFormData(prev => ({ ...prev, razorpay_auth: e.target.value }))}
                        placeholder="Enter Razorpay Auth Key"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login Attempts Limit
                      </label>
                      <input
                        type="number"
                        value={formData.login_attempts_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, login_attempts_limit: parseInt(e.target.value) || 3 }))}
                        min="1"
                        max="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Phone
                      </label>
                      <input
                        type="text"
                        value={formData.support_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, support_phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number Flashing Time (seconds)
                      </label>
                      <input
                        type="number"
                        value={formData.number_flashing_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, number_flashing_time: parseInt(e.target.value) || 5 }))}
                        min="1"
                        max="60"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Legacy Social Media Links */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    Legacy Social Media Links
                  </h2>
                  <div className="space-y-4">
                    <SocialInput
                      label="Telegram Link"
                      value={formData.telegram_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, telegram_link: e.target.value }))}
                      placeholder="Telegram Link"
                    />
                    <SocialInput
                      label="Facebook Link"
                      value={formData.facebook_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook_link: e.target.value }))}
                      placeholder="Facebook Link"
                    />
                    <SocialInput
                      label="YouTube Link"
                      value={formData.youtube_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, youtube_link: e.target.value }))}
                      placeholder="YouTube Link"
                    />
                    <SocialInput
                      label="Board Result Link"
                      value={formData.board_result_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, board_result_link: e.target.value }))}
                      placeholder="Board Result Link"
                    />
                    <SocialInput
                      label="YTDL Link"
                      value={formData.ytdl_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, ytdl_link: e.target.value }))}
                      placeholder="YTDL Link"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Routing Accounts Tab */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Routing Accounts</h2>
              <button
                onClick={() => setShowAddRouting(!showAddRouting)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Account
              </button>
            </div>

            {/* Add Routing Form */}
            {showAddRouting && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Routing Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Account ID</label>
                    <input
                      type="text"
                      name="account_id"
                      value={routingForm.account_id}
                      onChange={handleRoutingInputChange}
                      placeholder="Enter account ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Percentage</label>
                    <input
                      type="number"
                      name="percentage"
                      value={routingForm.percentage}
                      onChange={handleRoutingInputChange}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 pb-2">
                      <input
                        type="checkbox"
                        name="status"
                        checked={routingForm.status}
                        onChange={handleRoutingInputChange}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <button
                      onClick={handleAddRoutingAccount}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      {saving ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      onClick={() => setShowAddRouting(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Routing Accounts List */}
            {routingAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {routingAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{account.account_id}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            {account.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            account.status 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {account.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteRoutingClick(account.id, account.account_id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No routing accounts found. Add one to get started.
              </div>
            )}
          </div>
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null, name: '' })}
          onConfirm={handleDeleteRoutingConfirm}
          title="Delete Routing Account"
          message={`Are you sure you want to delete account "${deleteModal.name}"?`}
          itemName={deleteModal.name}
          isLoading={deleteLoading}
          confirmText="Delete"
          cancelText="Cancel"
          size="md"
        />
      </div>
    </div>
  );
};

// Toggle Item Component
const ToggleItem = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <span className="text-sm font-medium text-gray-700">{label}</span>
    {checked ? (
      <ToggleRight className="w-6 h-6 text-indigo-600" />
    ) : (
      <ToggleLeft className="w-6 h-6 text-gray-400" />
    )}
  </button>
);

// Social Input Component
const SocialInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
    />
  </div>
);

export default GeneralSetting;