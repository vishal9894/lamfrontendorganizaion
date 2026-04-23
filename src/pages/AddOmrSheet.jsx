import React, { useState, useCallback, memo, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FileText,
  Clock,
  CalendarClock,
  ListChecks,
  Layers,
  Award,
  Save,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Timer,
  ChevronDown,
  Key,
  Monitor,
  Calendar,
  Plus,
  Trash2,
} from "lucide-react";
import { handleCreateOmrSheet, handleMatchOmrSheetKey } from "../api/allApi";

/* ---------------- reusable components OUTSIDE main component ---------------- */

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  icon: Icon,
  required = true,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-2.5 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 ring-red-200"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
          }`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 flex gap-1 items-center">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
};

const TextAreaField = memo(
  ({ label, name, value, onChange, error, placeholder, icon: Icon }) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-3 pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={3}
            placeholder={placeholder}
            className={`w-full ${
              Icon ? "pl-10" : "pl-4"
            } pr-4 py-2.5 border rounded-xl bg-gray-50 resize-none focus:outline-none focus:ring-2
            ${
              error
                ? "border-red-500 ring-red-200"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
            }`}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 flex gap-1 items-center">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
      </div>
    );
  },
);

const SelectField = memo(
  ({ label, name, value, onChange, options, icon: Icon }) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full ${
              Icon ? "pl-10" : "pl-4"
            } pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200`}
          >
            {options.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  },
);

/* ---------------- Question Component with Dynamic Options and Multiple Select ---------------- */

const QuestionCard = memo(
  ({
    questionNumber,
    selectedOptions,
    onOptionSelect,
    numberOfOptions,
    questionType,
  }) => {
    const getOptions = () => {
      const options = [];
      const letters = ["A", "B", "C", "D", "E"];
      const colors = [
        "border-red-500",
        "border-blue-500",
        "border-green-500",
        "border-yellow-500",
        "border-purple-500",
      ];
      const bgColors = [
        "bg-red-100",
        "bg-blue-100",
        "bg-green-100",
        "bg-yellow-100",
        "bg-purple-100",
      ];

      for (let i = 0; i < numberOfOptions; i++) {
        options.push({
          value: letters[i],
          label: `Option ${letters[i]}`,
          borderColor: colors[i],
          bgColor: bgColors[i],
        });
      }
      return options;
    };

    const options = getOptions();
    const isMultiple = questionType === "multiple_correct";

    const handleOptionClick = (optionValue) => {
      if (isMultiple) {
        const currentSelected = selectedOptions || [];
        if (currentSelected.includes(optionValue)) {
          onOptionSelect(currentSelected.filter((v) => v !== optionValue));
        } else {
          onOptionSelect([...currentSelected, optionValue]);
        }
      } else {
        onOptionSelect(optionValue);
      }
    };

    const isOptionSelected = (optionValue) => {
      if (isMultiple) {
        return (selectedOptions || []).includes(optionValue);
      } else {
        return selectedOptions === optionValue;
      }
    };

    return (
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-md">
            {questionNumber}
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Question {questionNumber}
          </h3>
          {isMultiple && (
            <span className="ml-3 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Multiple answers allowed
            </span>
          )}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {isMultiple
              ? "Select the correct options:"
              : "Select the correct option:"}
          </label>

          <div className="flex flex-wrap gap-3">
            {options.map((option) => (
              <label
                key={option.value}
                className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer
                transition-all duration-200 border
                ${
                  isOptionSelected(option.value)
                    ? `${option.bgColor} ${option.borderColor} border-2 shadow-md`
                    : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                }
              `}
              >
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  name={`question_${questionNumber}`}
                  value={option.value}
                  checked={isOptionSelected(option.value)}
                  onChange={() => handleOptionClick(option.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`text-sm font-medium transition-colors duration-200
                ${isOptionSelected(option.value) ? "text-gray-900 font-semibold" : "text-gray-600"}
              `}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>

          {isMultiple && selectedOptions && selectedOptions.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Selected: {selectedOptions.join(", ")}
            </div>
          )}
        </div>
      </div>
    );
  },
);

/* ---------------- main component ---------------- */

const AddOmrSheet = () => {
  const [formData, setFormData] = useState({
    examKey: "",
    title: "",
    description: "",
    questionNumber: "",
    questionType: "single_correct",
    answerOptions: "4",
    timerType: "countdown",
    duration: "",
    bufferTime: "",
    correctMarks: "",
    wrongMarks: "",
    examDateTime: null,
    status: true,
    examMode: "online",
  });

  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [existingExamKeys, setExistingExamKeys] = useState([]);
  const [examKeyError, setExamKeyError] = useState("");

  // Fetch existing exam keys on component mount
  useEffect(() => {
    const fetchExamKeys = async () => {
      try {
        const response = await handleMatchOmrSheetKey();
        if (response && response.data) {
          setExistingExamKeys(response.data);
        }
      } catch (error) {
        console.error("Error fetching exam keys:", error);
      }
    };
    fetchExamKeys();
  }, []);

  /* ------------ CHANGE HANDLER ------------ */

  const handleChange = useCallback((e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Clear exam key error when user types
    if (name === "examKey") {
      setExamKeyError("");
    }
  }, []);

  const handleDateTimeChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      examDateTime: date,
    }));
  };

  // Check if exam key already exists
  const checkExamKeyExists = (examKey) => {
    if (!examKey) return false;
    return existingExamKeys.some(
      (item) => item.examKey && item.examKey.toLowerCase() === examKey.toLowerCase()
    );
  };

  const handleGenerateQuestions = (e) => {
    e.preventDefault();

    // Check if exam key already exists
    if (checkExamKeyExists(formData.examKey)) {
      setExamKeyError("This Exam Key already exists! Please use a different key.");
      return;
    }

    // Basic validation before generating questions
    const validationErrors = {};
    if (!formData.examKey) validationErrors.examKey = "Exam Key is required";
    if (!formData.title) validationErrors.title = "Title is required";
    if (!formData.questionNumber)
      validationErrors.questionNumber = "Number of questions is required";
    if (!formData.correctMarks)
      validationErrors.correctMarks = "Correct marks is required";
    if (!formData.wrongMarks)
      validationErrors.wrongMarks = "Wrong marks is required";
    if (!formData.duration) validationErrors.duration = "Duration is required";
    if (!formData.examDateTime)
      validationErrors.examDateTime = "Exam date and time is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const numQuestions = parseInt(formData.questionNumber);
    if (isNaN(numQuestions) || numQuestions <= 0) {
      setErrors({
        ...errors,
        questionNumber: "Please enter a valid number of questions",
      });
      return;
    }

    if (numQuestions > 100) {
      setErrors({ ...errors, questionNumber: "Maximum 100 questions allowed" });
      return;
    }

    // Generate questions array based on question type
    const generatedQuestions = [];
    for (let i = 1; i <= numQuestions; i++) {
      generatedQuestions.push({
        id: i,
        selectedOptions:
          formData.questionType === "multiple_correct" ? [] : null,
      });
    }

    setQuestions(generatedQuestions);
    setShowQuestions(true);
    setErrors({});
    setExamKeyError("");
  };

  const handleOptionSelect = (questionIndex, optionValue) => {
    const updatedQuestions = [...questions];

    if (formData.questionType === "multiple_correct") {
      updatedQuestions[questionIndex].selectedOptions = optionValue;
    } else {
      updatedQuestions[questionIndex].selectedOptions = optionValue;
    }

    setQuestions(updatedQuestions);
  };

  const validateQuestions = () => {
    const unansweredQuestions = [];

    questions.forEach((question, index) => {
      if (formData.questionType === "multiple_correct") {
        if (
          !question.selectedOptions ||
          question.selectedOptions.length === 0
        ) {
          unansweredQuestions.push(index + 1);
        }
      } else {
        if (!question.selectedOptions) {
          unansweredQuestions.push(index + 1);
        }
      }
    });

    return unansweredQuestions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double check exam key doesn't exist before saving
    if (checkExamKeyExists(formData.examKey)) {
      setExamKeyError("This Exam Key already exists! Please use a different key.");
      return;
    }

    // Validate all questions are answered
    const unansweredQuestions = validateQuestions();
    if (unansweredQuestions.length > 0) {
      setErrors({
        form: `Please answer questions: ${unansweredQuestions.join(", ")}`,
      });
      return;
    }

    // Prepare data for API
    const submitData = {
      examKey: formData.examKey,
      title: formData.title,
      description: formData.description,
      questionNumber: formData.questionNumber,
      questionType: formData.questionType,
      answerOptions: formData.answerOptions,
      timerType: formData.timerType,
      duration: formData.duration,
      bufferTime: formData.bufferTime,
      correctMarks: formData.correctMarks,
      wrongMarks: formData.wrongMarks,
      examDateTime: formData.examDateTime,
      status: formData.status,
      examMode: formData.examMode,
      questions: questions.map((q) => ({
        questionNumber: q.id,
        correctAnswer: q.selectedOptions,
      })),
    };

    try {
      setIsSubmitting(true);
      await handleCreateOmrSheet(submitData);
      setSubmitSuccess(true);
      
      // Reset form after successful save
      setFormData({
        examKey: "",
        title: "",
        description: "",
        questionNumber: "",
        questionType: "single_correct",
        answerOptions: "4",
        timerType: "countdown",
        duration: "",
        bufferTime: "",
        correctMarks: "",
        wrongMarks: "",
        examDateTime: null,
        status: true,
        examMode: "online",
      });
      setQuestions([]);
      setShowQuestions(false);
      
      // Refresh exam keys list
      const response = await handleMatchOmrSheetKey();
      if (response && response.data) {
        setExistingExamKeys(response.data);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.log(error);
      setErrors({ submit: error.message || "Failed to save OMR sheet" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    setShowQuestions(false);
    setQuestions([]);
  };

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;

    let answered = 0;
    questions.forEach((question) => {
      if (formData.questionType === "multiple_correct") {
        if (question.selectedOptions && question.selectedOptions.length > 0) {
          answered++;
        }
      } else {
        if (question.selectedOptions) {
          answered++;
        }
      }
    });

    return (answered / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    let count = 0;
    questions.forEach((question) => {
      if (formData.questionType === "multiple_correct") {
        if (question.selectedOptions && question.selectedOptions.length > 0) {
          count++;
        }
      } else {
        if (question.selectedOptions) {
          count++;
        }
      }
    });
    return count;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create OMR Sheet</h1>
        </div>

        {submitSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 text-green-700 p-4 rounded-xl flex gap-2 items-center border border-green-200">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">OMR Sheet Saved Successfully!</span>
          </div>
        )}

        {errors.form && typeof errors.form === "string" && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 text-red-700 p-4 rounded-xl border border-red-200">
            <div className="flex gap-2 items-center">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">{errors.form}</span>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl flex gap-2">
            <AlertCircle />
            {errors.submit}
          </div>
        )}

        <form
          onSubmit={showQuestions ? handleSubmit : handleGenerateQuestions}
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <div
            className={`${showQuestions ? "opacity-50 pointer-events-none" : ""} transition-opacity duration-300`}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <InputField
                  label="Exam Key"
                  name="examKey"
                  value={formData.examKey}
                  onChange={handleChange}
                  error={errors.examKey || examKeyError}
                  icon={Key}
                />
                {examKeyError && (
                  <p className="text-xs text-red-500 flex gap-1 items-center mt-1">
                    <AlertCircle className="h-3 w-3" /> {examKeyError}
                  </p>
                )}
                {formData.examKey && !examKeyError && checkExamKeyExists(formData.examKey) && (
                  <p className="text-xs text-red-500 flex gap-1 items-center mt-1">
                    <AlertCircle className="h-3 w-3" /> This Exam Key already exists!
                  </p>
                )}
                {formData.examKey && !checkExamKeyExists(formData.examKey) && formData.examKey.length > 0 && (
                  <p className="text-xs text-green-500 flex gap-1 items-center mt-1">
                    <CheckCircle2 className="h-3 w-3" /> Exam Key is available
                  </p>
                )}
              </div>

              <InputField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                icon={FileText}
              />

              <div className="md:col-span-2">
                <TextAreaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  icon={Layers}
                />
              </div>
            </div>

            {/* Configuration */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <InputField
                label="Number of Questions"
                name="questionNumber"
                type="text"
                value={formData.questionNumber}
                onChange={handleChange}
                error={errors.questionNumber}
                icon={ListChecks}
                placeholder="Enter 1-100"
              />

              <SelectField
                label="Question Type"
                name="questionType"
                value={formData.questionType}
                onChange={handleChange}
                icon={HelpCircle}
                options={[
                  {
                    value: "single_correct",
                    label: "Single Correct (Radio Buttons)",
                  },
                  {
                    value: "multiple_correct",
                    label: "Multiple Correct (Checkboxes)",
                  },
                ]}
              />

              <SelectField
                label="Answer Options"
                name="answerOptions"
                value={formData.answerOptions}
                onChange={handleChange}
                icon={HelpCircle}
                options={[
                  { value: "4", label: "4 Options (A-D)" },
                  { value: "5", label: "5 Options (A-E)" },
                ]}
              />

              <SelectField
                label="Timer Type"
                name="timerType"
                value={formData.timerType}
                onChange={handleChange}
                icon={Timer}
                options={[
                  { value: "countdown", label: "Countdown Timer" },
                  { value: "stopwatch", label: "Stopwatch (Count Up)" },
                ]}
              />
            </div>

            {/* Marks Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <InputField
                label="Correct Marks (+)"
                name="correctMarks"
                type="text"
                value={formData.correctMarks}
                onChange={handleChange}
                error={errors.correctMarks}
                icon={Award}
                placeholder="e.g., 1"
              />

              <InputField
                label="Wrong Marks (-)"
                name="wrongMarks"
                type="text"
                value={formData.wrongMarks}
                onChange={handleChange}
                error={errors.wrongMarks}
                icon={AlertCircle}
                placeholder="e.g., 0.25"
              />
            </div>

            {/* Time Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <InputField
                label="Duration (minutes)"
                name="duration"
                type="text"
                value={formData.duration}
                onChange={handleChange}
                error={errors.duration}
                icon={Timer}
                placeholder="Total exam time"
              />

              <InputField
                label="Buffer Time (minutes)"
                name="bufferTime"
                type="text"
                value={formData.bufferTime}
                onChange={handleChange}
                icon={Clock}
                placeholder="Extra time if needed"
              />
            </div>

            {/* Date and Time */}
            <div className="mt-6">
              <label className="block mb-2 font-semibold text-gray-700">
                Exam Date & Time
              </label>
              <DatePicker
                selected={formData.examDateTime}
                onChange={handleDateTimeChange}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.examDateTime
                    ? "border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
                placeholderText="Select date and time"
              />
              {errors.examDateTime && (
                <p className="text-xs text-red-500 flex gap-1 items-center mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.examDateTime}
                </p>
              )}
            </div>

            {/* Status */}
            <label className="flex gap-3 items-center mt-6 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Active Exam
              </span>
            </label>
          </div>

          {/* Questions Section */}
          {showQuestions && (
            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Questions ({questions.length})
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.questionType === "multiple_correct"
                      ? "Select all correct options for each question (using checkboxes)"
                      : "Select the correct option for each question (using radio buttons)"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {getAnsweredCount()}/{questions.length}
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    questionNumber={index + 1}
                    selectedOptions={question.selectedOptions}
                    onOptionSelect={(option) =>
                      handleOptionSelect(index, option)
                    }
                    numberOfOptions={parseInt(formData.answerOptions)}
                    questionType={formData.questionType}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {!showQuestions ? (
              <button
                type="submit"
                disabled={!!examKeyError || checkExamKeyExists(formData.examKey)}
                className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  (examKeyError || checkExamKeyExists(formData.examKey)) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus className="h-5 w-5" />
                Generate OMR Sheet
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save OMR Sheet
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Back to Edit
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default AddOmrSheet;