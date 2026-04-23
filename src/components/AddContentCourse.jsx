import {
  Video,
  FileText,
  FileQuestion,
  X,
  Type,
  Link,
  ImageIcon,
  Globe,
  Lock,
  Upload,
  Clock,
  Plus,
  Trash2,
  User,
  Award,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const AddContentCourse = ({
  onClose,
  onSubmit,
  parentId,
  contentType = null,
}) => {
  const [activeTab, setActiveTab] = useState(contentType || "video");
  const [loading, setLoading] = useState(false);

  // File states
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // VIDEO STATES (matches backend)
  const [videoName, setVideoName] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [videoSource, setVideoSource] = useState("station1");
  const [videoAccess, setVideoAccess] = useState("free");

  // PDF STATES (matches backend)
  const [pdfName, setPdfName] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfAccess, setPdfAccess] = useState("free");
  const [downloadType, setDownloadType] = useState("public");

  // TEST STATES (matches backend)
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [timeDuration, setTimeDuration] = useState("");
  const [testFields, setTestFields] = useState([
    { category: "", questions: "" },
  ]);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState("");
  const [testAccess, setTestAccess] = useState("free");
  const [testType, setTestType] = useState("Live");
  const [postedBy, setPostedBy] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);

  const addField = () => {
    setTestFields([...testFields, { category: "", questions: "" }]);
  };

  const removeField = (index) => {
    if (testFields.length > 1) {
      const updated = testFields.filter((_, i) => i !== index);
      setTestFields(updated);
    }
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...testFields];
    updated[index][key] = value;
    setTestFields(updated);
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };
  const handleSubmit = async () => {
    setLoading(true);

    const formData = new FormData();

    try {
      // ✅ COMMON FIELDS

      // 🔥 FIX: ALWAYS SEND TITLE (IMPORTANT FOR DB)
      let title = "";

      switch (activeTab) {
        // ================= VIDEO =================
        case "video":
          if (!videoName || !videoLink) {
            alert("Please fill in all required fields");
            setLoading(false);
            return;
          }

          title = videoName;

          formData.append("name", videoName);
          formData.append("title", title); // ✅ FIX ADDED
          formData.append("type", "video");
          formData.append("contentType", "video");
          formData.append("access", videoAccess);
          formData.append("videoLink", videoLink);
          formData.append("source", videoSource);

          if (videoThumbnail) {
            formData.append("thumbnail", videoThumbnail);
          }
          break;

        // ================= PDF =================
        case "pdf":
          if (!pdfFile) {
            alert("Please upload a PDF file");
            setLoading(false);
            return;
          }

          title = pdfTitle || pdfName || "PDF Document";

          formData.append("name", pdfName || "Untitled PDF");
          formData.append("title", title); // ✅ FIX ADDED
          formData.append("type", "pdf");
          formData.append("contentType", "pdf");
          formData.append("access", pdfAccess);
          formData.append("downloadType", downloadType);
          formData.append("file", pdfFile);
          break;

        // ================= TEST =================
        case "test":
          if (!testName) {
            alert("Please enter a test name");
            setLoading(false);
            return;
          }

          const invalidField = testFields.some(
            (item) =>
              !item.category?.trim() ||
              !item.questions ||
              Number(item.questions) <= 0,
          );

          if (invalidField) {
            toast("Please fill all category names and question counts");
            setLoading(false);
            return;
          }

          title = testName;

          formData.append("name", testName);
          formData.append("title", title);
          formData.append("type", "test");
          formData.append("contentType", "test");
          formData.append("access", testAccess);
          formData.append("description", testDescription || "");

          if (timeDuration) {
            formData.append("duration", String(parseInt(timeDuration)));
          }

          formData.append("categories", JSON.stringify(testFields));
          formData.append("negativeMarking", String(negativeMarking));

          if (negativeMarks) {
            formData.append("negativeMarks", String(parseFloat(negativeMarks)));
          }

          formData.append("testType", testType);
          formData.append("postedBy", postedBy || "");
          break;
      }

      // ✅ DEBUG
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // ✅ API CALL
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "video",
      label: "Video",
      icon: Video,
      disabled: contentType && contentType !== "video",
    },
    {
      id: "pdf",
      label: "PDF",
      icon: FileText,
      disabled: contentType && contentType !== "pdf",
    },
    {
      id: "test",
      label: "Test",
      icon: FileQuestion,
      disabled: contentType && contentType !== "test",
    },
  ];

  const inputClasses =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
  const radioGroupClasses = "flex gap-4 flex-wrap";
  const radioLabelClasses =
    "flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors";
  const buttonClasses =
    "px-5 py-2.5 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2";
  const disabledTabClasses = "opacity-50 cursor-not-allowed";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white w-[700px] rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">
            {contentType
              ? `Add ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`
              : "Add Course Content"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isDisabled = tab.disabled;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                  isDisabled
                    ? disabledTabClasses
                    : isActive
                      ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ================= VIDEO ================= */}
          {activeTab === "video" && (
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>
                  <Type size={16} className="inline mr-1" />
                  Video Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to the Course"
                  className={inputClasses}
                  value={videoName}
                  onChange={(e) => setVideoName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <Link size={16} className="inline mr-1" />
                  Video Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={inputClasses}
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  YouTube, Vimeo, Google Meet, or any video URL
                </p>
              </div>

              <div>
                <label className={labelClasses}>Video Source</label>
                <div className="flex gap-3">
                  {["station1", "station2"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setVideoSource(s)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        videoSource === s
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClasses}>
                  <ImageIcon size={16} className="inline mr-1" />
                  Upload Video Thumbnail (Optional)
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gray-50"
                  onClick={() =>
                    document.getElementById("video-thumbnail-upload").click()
                  }
                >
                  <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                  {videoThumbnail ? (
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        {videoThumbnail.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(videoThumbnail.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      {videoThumbnail.type.startsWith("image/") && (
                        <img
                          src={URL.createObjectURL(videoThumbnail)}
                          alt="Thumbnail preview"
                          className="mt-3 max-h-32 mx-auto rounded-lg shadow-md"
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        Click to upload thumbnail image for the video
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG, GIF (max. 5MB)
                      </p>
                      <p className="text-xs text-blue-500 mt-2">
                        Recommended size: 1280x720 pixels
                      </p>
                    </>
                  )}
                  <input
                    id="video-thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setVideoThumbnail)}
                  />
                </div>
                {videoThumbnail && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓ Thumbnail selected</span>
                    <button
                      onClick={() => setVideoThumbnail(null)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClasses}>Access Type</label>
                <div className={radioGroupClasses}>
                  {["free", "paid"].map((a) => (
                    <label key={a} className={radioLabelClasses}>
                      <input
                        type="radio"
                        name="videoAccess"
                        checked={videoAccess === a}
                        onChange={() => setVideoAccess(a)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="capitalize">{a}</span>
                      {a === "free" ? (
                        <Globe size={16} className="ml-1 text-green-600" />
                      ) : (
                        <Lock size={16} className="ml-1 text-orange-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {videoLink && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Video Preview:
                  </p>
                  <div className="text-sm text-gray-600 break-all">
                    <Link size={14} className="inline mr-1" />
                    {videoLink}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= PDF ================= */}
          {activeTab === "pdf" && (
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>PDF Name</label>
                <input
                  type="text"
                  placeholder="e.g., Course Handbook"
                  className={inputClasses}
                  value={pdfName}
                  onChange={(e) => setPdfName(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClasses}>PDF Title</label>
                <input
                  type="text"
                  placeholder="e.g., Chapter 1: Introduction"
                  className={inputClasses}
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <Upload size={16} className="inline mr-1" />
                  Upload PDF <span className="text-red-500">*</span>
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50"
                  onClick={() => document.getElementById("pdf-upload").click()}
                >
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  {pdfFile ? (
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        Click to upload PDF
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF files only (max. 50MB)
                      </p>
                    </>
                  )}
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setPdfFile)}
                  />
                </div>
                {pdfFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓ PDF selected</span>
                    <button
                      onClick={() => setPdfFile(null)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClasses}>PDF Access</label>
                <div className="flex gap-3">
                  {["free", "paid"].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setPdfAccess(a)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        pdfAccess === a
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {a === "free" ? <Globe size={16} /> : <Lock size={16} />}
                      <span className="capitalize">{a}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClasses}>Download Option</label>
                <div className="flex gap-3">
                  {["public", "private"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDownloadType(d)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        downloadType === d
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TEST ================= */}
          {activeTab === "test" && (
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>
                  Test Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Midterm Examination"
                  className={inputClasses}
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClasses}>Test Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe the test format, topics covered, etc."
                  className={`${inputClasses} resize-none`}
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className={labelClasses}>
                  <Clock size={16} className="inline mr-1" />
                  Time Duration (minutes)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 60"
                  className={inputClasses}
                  value={timeDuration}
                  onChange={(e) => setTimeDuration(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClasses}>Categories and Questions</label>
                <div className="space-y-3">
                  {testFields.map((field, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input
                        type="text"
                        placeholder="Category name"
                        value={field.category}
                        onChange={(e) =>
                          handleFieldChange(index, "category", e.target.value)
                        }
                        required
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="# Questions"
                        value={field.questions}
                        onChange={(e) =>
                          handleFieldChange(index, "questions", e.target.value)
                        }
                        required
                        className="w-28 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        {index === testFields.length - 1 && (
                          <button
                            type="button"
                            onClick={addField}
                            className="p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Add category"
                          >
                            <Plus size={20} />
                          </button>
                        )}
                        {testFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Remove category"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add categories with the number of questions in each
                </p>
              </div>

              <div>
                <label className={labelClasses}>
                  <User size={16} className="inline mr-1" />
                  Posted By
                </label>
                <input
                  type="text"
                  placeholder="Instructor name"
                  className={inputClasses}
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={advancedMode}
                    onChange={(e) => setAdvancedMode(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">
                    Support advanced mode
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={negativeMarking}
                    onChange={() => setNegativeMarking(!negativeMarking)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Support negative marking
                  </span>
                </label>
              </div>

              {negativeMarking && (
                <div className="ml-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award size={16} className="inline mr-1" />
                    Negative Marks per wrong answer
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 0.25"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-40 px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    step="0.25"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className={labelClasses}>Test Access</label>
                <div className={radioGroupClasses}>
                  {["free", "paid"].map((a) => (
                    <label key={a} className={radioLabelClasses}>
                      <input
                        type="radio"
                        name="testAccess"
                        checked={testAccess === a}
                        onChange={() => setTestAccess(a)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="capitalize">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClasses}>Test Type</label>
                <div className="flex gap-3">
                  {["Live", "Coming soon"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTestType(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        testType === type
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className={`${buttonClasses} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${buttonClasses} bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Saving..." : "Save Content"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContentCourse;
