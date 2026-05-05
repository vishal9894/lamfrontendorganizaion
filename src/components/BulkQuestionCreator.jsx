import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Layers,
  BookOpen,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Upload,
  AlertCircle,
  CheckCircle,
  FileQuestion
} from "lucide-react";
import { handleCreateQuestions } from "../api/allApi";
import DeleteModal from "./DeleteModal";

// Image Uploader Component
const ImageUploader = ({ field, preview, onUpload, onRemove, label }) => {
  return (
    <div className="space-y-2">
      {label && <span className="text-xs font-medium text-gray-500">{label}</span>}
      {preview ? (
        <div className="relative inline-block group w-20 h-20">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={() => onRemove?.(field)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-sm hover:bg-red-600 transition"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-all py-2 px-3 rounded-lg hover:bg-blue-50 border border-blue-100">
          <Upload size={14} />
          <span>Upload</span>
          <input type="file" accept="image/*" onChange={(e) => onUpload?.(e, field)} className="hidden" />
        </label>
      )}
    </div>
  );
};

// Option Input Component
const OptionInput = React.memo(
  ({
    letter,
    value,
    error,
    onChange,
    imageField,
    imagePreview,
    onImageUpload,
    onImageRemove
  }) => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
            {letter}
          </span>
          <input
            type="text"
            name={`option_${letter.toLowerCase()}`}
            placeholder={`Option ${letter} text`}
            value={value}
            onChange={onChange}
            className={`flex-1 border-2 rounded-lg px-3 py-2 text-sm ${error ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
          />
        </div>
        <div className="mt-2">
          <ImageUploader
            field={imageField}
            preview={imagePreview}
            onUpload={onImageUpload}
            onRemove={onImageRemove}
            label="Option image (optional)"
          />
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-500 flex items-center gap-1 ml-2">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
      </div>
    );
  }
);

const BulkQuestionCreator = ({
  isOpen,
  onClose,
  quizId,
  categories,
  totalQuestions,
  onComplete
}) => {
  // Build question queue with proper counts for each category
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    questionImage: null,
    option_a: "",
    option_a_image: null,
    option_b: "",
    option_b_image: null,
    option_c: "",
    option_c_image: null,
    option_d: "",
    option_d_image: null,
    correctOption: "",
    solution: "",
    solutionImage: null,
    marks: 1,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Build question queue when modal opens - using the count from each category
  useEffect(() => {
    if (isOpen && categories && categories.length > 0) {
      const queue = [];
      categories.forEach((cat, catIndex) => {
        const count = parseInt(cat.count) || 0;
        for (let i = 0; i < count; i++) {
          queue.push({
            category: cat.name,
            categoryIndex: catIndex,
            questionInCategory: i + 1,
            globalIndex: queue.length + 1,
            isCompleted: false
          });
        }
      });
      setQuestionQueue(queue);
      setCurrentIndex(0);
      setCompletedCount(0);
      setShowSaveButton(false);
      resetForm();
    }
  }, [isOpen, categories]);

  const resetForm = () => {
    setFormData({
      question: "",
      questionImage: null,
      option_a: "",
      option_a_image: null,
      option_b: "",
      option_b_image: null,
      option_c: "",
      option_c_image: null,
      option_d: "",
      option_d_image: null,
      correctOption: "",
      solution: "",
      solutionImage: null,
      marks: 1,
    });
    setPreviewImages({});
    setErrors({});
    setCurrentStep(1);
    setSuccessMessage("");
  };

  const currentQuestion = questionQueue[currentIndex];
  const isLastQuestion = currentIndex === questionQueue.length - 1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [field]: "Image must be less than 5MB" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImages((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setPreviewImages((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[field];
      return newPreviews;
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.question.trim()) newErrors.question = "Question text is required";
    }
    if (step === 2) {
      if (!formData.option_a.trim()) newErrors.option_a = "Option A is required";
      if (!formData.option_b.trim()) newErrors.option_b = "Option B is required";
      if (!formData.option_c.trim()) newErrors.option_c = "Option C is required";
      if (!formData.option_d.trim()) newErrors.option_d = "Option D is required";
      if (!formData.correctOption) newErrors.correctOption = "Please select correct answer";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const saveCurrentQuestion = async () => {
    if (!validateStep(1) || !validateStep(2)) return false;
    if (!quizId) {
      setErrors({ general: "Quiz ID is missing. Please try again." });
      return false;
    }

    try {
      const submitData = new FormData();
      submitData.append("quizId", quizId);
      submitData.append("question", formData.question.trim());
      submitData.append("option_a", formData.option_a.trim());
      submitData.append("option_b", formData.option_b.trim());
      submitData.append("option_c", formData.option_c.trim());
      submitData.append("option_d", formData.option_d.trim());
      submitData.append("correctOption", formData.correctOption);
      submitData.append("solution", formData.solution.trim());
      submitData.append("category", currentQuestion?.category || "");
      submitData.append("marks", formData.marks.toString());
      submitData.append("questionNumber", (currentIndex + 1).toString());

      const imageFields = [
        "questionImage",
        "option_a_image",
        "option_b_image",
        "option_c_image",
        "option_d_image",
        "solutionImage",
      ];

      imageFields.forEach((field) => {
        if (formData[field] && formData[field] instanceof File) {
          submitData.append(field, formData[field]);
        }
      });

      const res = await handleCreateQuestions(submitData);

      if (res?.success || res?.status === 200 || res?.data) {
        return true;
      } else {
        setErrors({ general: res?.message || "Failed to create question" });
        return false;
      }
    } catch (err) {
      console.error("Error creating question:", err);
      setErrors({
        general: err.response?.data?.message || err.message || "An unexpected error occurred."
      });
      return false;
    }
  };

  const handleSaveAndNext = async () => {
    setLoading(true);
    setErrors({});

    const saved = await saveCurrentQuestion();

    if (saved) {
      // Mark current question as completed
      const updatedQueue = [...questionQueue];
      updatedQueue[currentIndex] = { ...updatedQueue[currentIndex], isCompleted: true };
      setQuestionQueue(updatedQueue);

      const newCompletedCount = completedCount + 1;
      setCompletedCount(newCompletedCount);

      if (isLastQuestion) {
        // All questions completed - show save button
        setShowSaveButton(true);
        setSuccessMessage("All questions have been created! Click 'Save All Questions' to finish.");
        setCurrentStep(1);
      } else {
        // Move to next question
        setCurrentIndex((prev) => prev + 1);
        resetForm();
        setSuccessMessage(`Question ${currentIndex + 1} saved! Creating question ${currentIndex + 2}...`);
        setTimeout(() => setSuccessMessage(""), 2000);
      }
    }

    setLoading(false);
  };

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    setErrors({});

    // Save the last question if not already saved
    if (!questionQueue[currentIndex]?.isCompleted) {
      const saved = await saveCurrentQuestion();
      if (!saved) {
        setIsSubmitting(false);
        return;
      }
    }

    // All questions are saved
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete?.();
      onClose();
    }, 500);
  };

  const handleClose = () => {
    if (completedCount > 0 && completedCount < questionQueue.length) {
      setShowDeleteModal(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowDeleteModal(false);
    onClose();
  };

  const cancelClose = () => {
    setShowDeleteModal(false);
  };

  if (!isOpen) return null;

  // If all questions are completed, show completion screen
  if (showSaveButton || (completedCount === questionQueue.length && questionQueue.length > 0)) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center">
            <CheckCircle size={48} className="mx-auto mb-3" />
            <h2 className="text-2xl font-bold">All Questions Created!</h2>
            <p className="text-green-100 mt-1">You have successfully created all {questionQueue.length} questions</p>
          </div>

          <div className="p-6 text-center">
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-green-700">Questions Created</div>
              <div className="text-xs text-green-600 mt-1">out of {questionQueue.length} total</div>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {questionQueue.map((q, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Q{idx + 1}: {q.category}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAll}
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save All Questions
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-3 px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const steps = [
    { number: 1, title: "Question", icon: HelpCircle },
    { number: 2, title: "Options", icon: Layers },
    { number: 3, title: "Solution", icon: BookOpen },
  ];

  const progressPercentage = ((currentIndex) / questionQueue.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <FileQuestion size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Questions</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-indigo-600 font-medium">
                  Question {currentIndex + 1} of {questionQueue.length}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">
                  Category: <span className="font-medium text-gray-800">{currentQuestion.category}</span>
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-xs text-gray-500">
                  (#{currentQuestion.questionInCategory} in this category)
                </span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} disabled={loading} className="p-2 rounded-lg hover:bg-white/80 transition">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Category Progress */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => {
              const catQuestions = questionQueue.filter(q => q.categoryIndex === idx);
              const completedInCat = catQuestions.filter(q => q.isCompleted).length;
              const isCurrentCat = currentQuestion.categoryIndex === idx;

              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isCurrentCat
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                    : completedInCat === catQuestions.length && catQuestions.length > 0
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                >
                  {cat.name}: {completedInCat}/{cat.count}
                  {isCurrentCat && <span className="ml-1 animate-pulse">←</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-6 py-2 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700">{errors.general}</span>
              <button onClick={() => setErrors({})} className="ml-auto">
                <X size={14} className="text-red-500" />
              </button>
            </div>
          )}

          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive
                      ? "bg-gray-900 text-white"
                      : isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
                    <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight size={16} className="text-gray-300 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Question */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Category: {currentQuestion.category}</span>
                  <span className="ml-2 text-blue-600">
                    (Question {currentQuestion.questionInCategory} of {categories[currentQuestion.categoryIndex]?.count} in this category)
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Enter your question..."
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.question ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  rows={4}
                />
                {errors.question && <p className="mt-1 text-xs text-red-500">{errors.question}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <ImageUploader
                  field="questionImage"
                  preview={previewImages.questionImage}
                  onUpload={handleImageChange}
                  onRemove={removeImage}
                  label="Question Image (optional)"
                />
              </div>
            </div>
          )}

          {/* Step 2: Options */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Current Question:</span> {formData.question.substring(0, 50)}...
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <OptionInput
                  letter="A"
                  value={formData.option_a}
                  error={errors.option_a}
                  onChange={handleChange}
                  imageField="option_a_image"
                  imagePreview={previewImages.option_a_image}
                  onImageUpload={handleImageChange}
                  onImageRemove={removeImage}
                />
                <OptionInput
                  letter="B"
                  value={formData.option_b}
                  error={errors.option_b}
                  onChange={handleChange}
                  imageField="option_b_image"
                  imagePreview={previewImages.option_b_image}
                  onImageUpload={handleImageChange}
                  onImageRemove={removeImage}
                />
                <OptionInput
                  letter="C"
                  value={formData.option_c}
                  error={errors.option_c}
                  onChange={handleChange}
                  imageField="option_c_image"
                  imagePreview={previewImages.option_c_image}
                  onImageUpload={handleImageChange}
                  onImageRemove={removeImage}
                />
                <OptionInput
                  letter="D"
                  value={formData.option_d}
                  error={errors.option_d}
                  onChange={handleChange}
                  imageField="option_d_image"
                  imagePreview={previewImages.option_d_image}
                  onImageUpload={handleImageChange}
                  onImageRemove={removeImage}
                />
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Correct Answer <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {["A", "B", "C", "D"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, correctOption: opt }))}
                      className={`py-2 px-6 rounded-lg border text-sm font-medium transition-all ${formData.correctOption === opt
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.correctOption && (
                  <p className="mt-2 text-xs text-red-500">{errors.correctOption}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Solution */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <CheckCircle size={14} className="inline mr-1" />
                  <span className="font-medium">Almost done!</span> Add an optional solution explanation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solution Explanation (Optional)
                </label>
                <textarea
                  name="solution"
                  value={formData.solution}
                  onChange={handleChange}
                  placeholder="Explain the solution..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <ImageUploader
                field="solutionImage"
                preview={previewImages.solutionImage}
                onUpload={handleImageChange}
                onRemove={removeImage}
                label="Solution Image (optional)"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1 || loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white disabled:opacity-50 transition"
            >
              <ChevronLeft size={16} className="inline mr-1" />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
              >
                Next
                <ChevronRight size={16} className="inline ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndNext}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isLastQuestion ? "Save Question" : "Save & Next"}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="text-sm text-gray-500">
            {completedCount} of {questionQueue.length} completed
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={cancelClose}
        onConfirm={confirmClose}
        title="Cancel Question Creation"
        message={`You have created ${completedCount} of ${questionQueue.length} questions. Are you sure you want to cancel?`}
        itemName="Question Creation"
        confirmText="Cancel"
        cancelText="Continue"
        size="md"
      />
    </div>
  );
};

export default BulkQuestionCreator;