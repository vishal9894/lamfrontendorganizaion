import { useState } from "react";
import { handleCreateMcq } from "../api/allApi";
import BulkQuestionCreator from "../components/BulkQuestionCreator";
import {
  FiAlertCircle,
  FiBook,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiCpu,
  FiEye,
  FiGrid,
  FiHelpCircle,
  FiLayers,
  FiMinusCircle,
  FiPlus,
  FiSave,
  FiSettings,
  FiTag,
  FiTrash2,
  FiUser
} from "react-icons/fi";

const AddQuiz = () => {
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    duration: "",
    createdBy: "",
    advancedMode: false,
    negativeMarks: 0,
    showSolution: false
  });

  const [categories, setCategories] = useState([
    { name: "", count: "" }
  ]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    questions: true,
    settings: true
  });

  // Modal state for bulk question creation
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [createdQuizData, setCreatedQuizData] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCategoryChange = (index, e) => {
    const { name, value } = e.target;
    const values = [...categories];
    values[index][name] = value;
    setCategories(values);
  };

  const addCategory = () => {
    setCategories([...categories, { name: "", count: "" }]);
  };

  const removeCategory = (index) => {
    if (categories.length > 1) {
      const values = [...categories];
      values.splice(index, 1);
      setCategories(values);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Quiz name is required";
    }
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Valid duration is required";
    }
    if (!formData.createdBy.trim()) {
      newErrors.createdBy = "Creator name is required";
    }

    categories.forEach((cat, index) => {
      if (!cat.name.trim()) {
        newErrors[`cat_name_${index}`] = `Category ${index + 1} name required`;
      }
      if (!cat.count || cat.count <= 0) {
        newErrors[`cat_count_${index}`] = `Valid count required for category ${index + 1}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalQuestions = () => {
    return categories.reduce((acc, cat) => acc + (parseInt(cat.count) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-300');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const totalQuestions = getTotalQuestions();
      const categoryList = categories.map(cat => cat.name).join(", ");
      const negMarks = parseFloat(formData.negativeMarks) || 0;

      const quizPayload = {
        category: formData.category,
        name: formData.name,
        duration: parseInt(formData.duration),
        createdBy: formData.createdBy,
        advancedMode: formData.advancedMode,
        negativeMarks: negMarks,
        negativeMarking: negMarks > 0,
        showSolution: formData.showSolution,
        questionCategory: categoryList,
        numberOfQuestions: totalQuestions
      };

      console.log("Creating quiz with payload:", quizPayload);

      const quizResponse = await handleCreateMcq(quizPayload);
      console.log("Quiz creation response:", quizResponse);

      if (quizResponse && (quizResponse.id || quizResponse.data?.id)) {
        const quizId = quizResponse.id || quizResponse.data?.id;
        
        setCreatedQuizData({
          id: quizId,
          categories: categories,
          totalQuestions: totalQuestions,
          name: formData.name
        });
        
        setShowQuestionModal(true);
        setSuccessMessage(`Quiz "${formData.name}" created! Now add your questions.`);
      } else {
        throw new Error(quizResponse?.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      setErrors({ general: error.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
              <p className="mt-2 text-gray-600">Configure your quiz details and question categories</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Total Questions:</span>
              <span className="ml-2 text-xl font-bold text-blue-600">{getTotalQuestions()}</span>
            </div>
          </div>

          
         
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="border-b border-gray-100">
              <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('basic')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FiLayers className="text-white" size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                      <p className="text-sm text-gray-500">Quiz category, name, and duration</p>
                    </div>
                  </div>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    {expandedSections.basic ? <FiChevronDown size={20} className="text-gray-400" /> : <FiChevronRight size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {expandedSections.basic && (
                <div className="p-6 pt-0 animate-slideDown">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiTag className="text-blue-500" /> Quiz Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input type="text" name="category" placeholder="e.g., Mathematics, Science" value={formData.category} onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}`} />
                        <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors.category && <p className="text-sm text-red-600 flex items-center gap-1"><FiAlertCircle size={14} />{errors.category}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiBook className="text-blue-500" /> Quiz Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input type="text" name="name" placeholder="e.g., Mathematics Basics" value={formData.name} onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}`} />
                        <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors.name && <p className="text-sm text-red-600 flex items-center gap-1"><FiAlertCircle size={14} />{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiClock className="text-blue-500" /> Duration (Minutes) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input type="number" name="duration" placeholder="60" min="1" value={formData.duration} onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}`} />
                        <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors.duration && <p className="text-sm text-red-600 flex items-center gap-1"><FiAlertCircle size={14} />{errors.duration}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiUser className="text-blue-500" /> Created By <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input type="text" name="createdBy" placeholder="John Doe" value={formData.createdBy} onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.createdBy ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}`} />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors.createdBy && <p className="text-sm text-red-600 flex items-center gap-1"><FiAlertCircle size={14} />{errors.createdBy}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Question Categories Section */}
            <div className="border-b border-gray-100">
              <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('questions')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <FiGrid className="text-white" size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Question Categories</h2>
                      <p className="text-sm text-gray-500">Configure question distribution by category</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">Total: {getTotalQuestions()} questions</span>
                    <button type="button" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      {expandedSections.questions ? <FiChevronDown size={20} className="text-gray-400" /> : <FiChevronRight size={20} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {expandedSections.questions && (
                <div className="p-6 pt-0 animate-slideDown">
                  <div className="space-y-4">
                    {categories.map((cat, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white text-xs flex items-center justify-center">{index + 1}</div>
                            Category {index + 1}
                          </span>
                          <button type="button" onClick={() => removeCategory(index)} disabled={categories.length === 1}
                            className={`p-2 rounded-lg transition-colors ${categories.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}>
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Category Name</label>
                            <div className="relative">
                              <input type="text" name="name" placeholder="e.g., Algebra, Geometry" value={cat.name} onChange={(e) => handleCategoryChange(index, e)}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors[`cat_name_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}`} />
                              <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            </div>
                            {errors[`cat_name_${index}`] && <p className="text-xs text-red-600">{errors[`cat_name_${index}`]}</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Number of Questions</label>
                            <div className="relative">
                              <input type="number" name="count" placeholder="10" min="1" value={cat.count} onChange={(e) => handleCategoryChange(index, e)}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors[`cat_count_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}`} />
                              <FiHelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            </div>
                            {errors[`cat_count_${index}`] && <p className="text-xs text-red-600">{errors[`cat_count_${index}`]}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addCategory} className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                        <FiPlus className="text-white" size={18} />
                      </div>
                      <span className="font-medium text-gray-600 group-hover:text-blue-600">Add Question Category</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="border-b border-gray-100">
              <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('settings')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <FiSettings className="text-white" size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Quiz Settings</h2>
                      <p className="text-sm text-gray-500">Configure advanced options and features</p>
                    </div>
                  </div>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    {expandedSections.settings ? <FiChevronDown size={20} className="text-gray-400" /> : <FiChevronRight size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {expandedSections.settings && (
                <div className="p-6 pt-0 animate-slideDown">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiMinusCircle className="text-red-500" /> Negative Mark
                      </label>
                      <div className="relative">
                        <input type="number" name="negativeMarks" placeholder="0.25" min="0" step="0.25" value={formData.negativeMarks} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all" />
                        <FiMinusCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      <p className="text-xs text-gray-500">Deduct marks for wrong answers</p>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" name="advancedMode" checked={formData.advancedMode} onChange={handleChange} className="sr-only" />
                          <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${formData.advancedMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-300'}`}>
                            {formData.advancedMode && <FiCheckCircle className="text-white" size={14} />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FiCpu className={formData.advancedMode ? 'text-purple-600' : 'text-gray-400'} />
                            <span className="text-sm font-medium text-gray-700">Advanced Mode</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Enable advanced features and question types</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" name="showSolution" checked={formData.showSolution} onChange={handleChange} className="sr-only" />
                          <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${formData.showSolution ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-300'}`}>
                            {formData.showSolution && <FiCheckCircle className="text-white" size={14} />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FiEye className={formData.showSolution ? 'text-green-600' : 'text-gray-400'} />
                            <span className="text-sm font-medium text-gray-700">Show Solution</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Show solution explanation after wrong answers</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-end gap-4">
                <button type="button" onClick={() => window.history.back()} className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-white hover:border-gray-300 transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]">
                  {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating...</> : <><FiSave size={20} />Create Quiz</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Bulk Question Creator Modal */}
      {showQuestionModal && createdQuizData && (
        <BulkQuestionCreator
          isOpen={showQuestionModal}
          onClose={() => {
            setShowQuestionModal(false);
            window.location.href = '/view-quiz';
          }}
          quizId={createdQuizData.id}
          categories={createdQuizData.categories}
          totalQuestions={createdQuizData.totalQuestions}
          onComplete={() => {
            setTimeout(() => {
              window.location.href = '/view-quiz';
            }, 1500);
          }}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default AddQuiz;