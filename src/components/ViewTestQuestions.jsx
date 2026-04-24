import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  handleGetTestQuestions, 
  handleDeleteQuestion, 
  handleUpdateQuestion, 
  handleDeleteTestQuestion 
} from "../api/allApi";
import { 
  FiTrash2, FiEdit2, FiCheckCircle, FiXCircle, FiAlertCircle, 
  FiChevronLeft, FiPlus, FiSave, FiX, FiCheck, FiChevronRight,
  FiDownload, FiUpload, FiShield, FiBookOpen, FiAward
} from "react-icons/fi";

const ViewTestQuestions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_e: "",
    correctOption: "",
    marks: ""
  });

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await handleGetTestQuestions(testId);
      const questionsData = response.data || response;
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCorrectOptionLetter = (correctOption) => {
    const optionMap = {
      option_a: "A",
      option_b: "B",
      option_c: "C",
      option_d: "D",
      option_e: "E",
    };
    return optionMap[correctOption] || correctOption;
  };

  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setEditFormData({
      question: question.question || "",
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      option_e: question.option_e || "",
      correctOption: question.correctOption || "",
      marks: question.marks || ""
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const response = await handleUpdateQuestion(editingQuestion.id, editFormData);
      if (response.data || response) {
        await fetchQuestions();
        setEditingQuestion(null);
        setSuccess("Question updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
        setEditFormData({
          question: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          option_e: "",
          correctOption: "",
          marks: ""
        });
      }
    } catch (err) {
      console.error("Error updating question:", err);
      setError("Failed to update question. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    
    setLoading(true);
    try {
      // Single delete - send specific ID
      await handleDeleteTestQuestion(questionToDelete.id);
      await fetchQuestions();
      setShowDeleteModal(false);
      setQuestionToDelete(null);
      setSuccess("Question deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting question:", err);
      setError("Failed to delete question. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  // Bulk Selection Handlers
  const toggleQuestionSelection = (questionId) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      const allIds = questions.map(q => q.id);
      setSelectedQuestions(new Set(allIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Check if all questions are selected for bulk delete with 'all'
      if (selectedQuestions.size === questions.length) {
        // Send 'all' to delete all questions
        await handleDeleteTestQuestion('all');
        setSuccess(`Successfully deleted all ${selectedQuestions.size} questions!`);
      } else {
        // Delete selected questions individually
        const questionIds = Array.from(selectedQuestions);
        const deletePromises = questionIds.map(questionId => 
          handleDeleteTestQuestion(questionId)
        );
        await Promise.all(deletePromises);
        setSuccess(`Successfully deleted ${questionIds.length} question(s)!`);
      }
      
      // Refresh questions list
      await fetchQuestions();
      
      // Clear selection and exit bulk mode
      setSelectedQuestions(new Set());
      setIsBulkDeleteMode(false);
      setShowBulkDeleteConfirm(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting questions:", err);
      setError("Failed to delete questions. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteConfirm(false);
  };

  const exitBulkMode = () => {
    setIsBulkDeleteMode(false);
    setSelectedQuestions(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FiBookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Test Questions</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage and organize test questions</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2 ml-11">Test ID: {testId}</p>
            </div>
            <div className="flex gap-3">
              {isBulkDeleteMode ? (
                <>
                  <button
                    onClick={exitBulkMode}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    disabled={selectedQuestions.size === 0}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      selectedQuestions.size === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
                    }`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Selected ({selectedQuestions.size})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  {questions.length > 0 && (
                    <button
                      onClick={() => setIsBulkDeleteMode(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md shadow-red-200"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Bulk Delete
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/manage-questions/${testId}`)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md shadow-blue-200"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Question
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-slide-down">
            <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Success</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-down">
            <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FiEdit2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Edit Question</h2>
                </div>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="question"
                    value={editFormData.question}
                    onChange={handleEditFormChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option A <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="option_a"
                      value={editFormData.option_a}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option B <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="option_b"
                      value={editFormData.option_b}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option C <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="option_c"
                      value={editFormData.option_c}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option D <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="option_d"
                      value={editFormData.option_d}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option E
                    </label>
                    <input
                      type="text"
                      name="option_e"
                      value={editFormData.option_e}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Option <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="correctOption"
                      value={editFormData.correctOption}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select correct option</option>
                      <option value="option_a">Option A</option>
                      <option value="option_b">Option B</option>
                      <option value="option_c">Option C</option>
                      <option value="option_d">Option D</option>
                      <option value="option_e">Option E</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="marks"
                      value={editFormData.marks}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-blue-200"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-5 h-5" />
                        Update Question
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Single Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-up">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Delete Question
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete this question? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-up">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Bulk Delete Questions
                </h3>
                <p className="text-gray-500 mb-4">
                  Are you sure you want to delete <span className="font-bold text-red-600">{selectedQuestions.size}</span> question(s)?
                </p>
                {selectedQuestions.size === questions.length && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This will delete <strong>ALL</strong> questions in this test.
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 mb-4 max-h-40 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-2">Questions to be deleted:</p>
                  {Array.from(selectedQuestions).slice(0, 5).map((id, idx) => {
                    const question = questions.find(q => q.id === id);
                    return (
                      <p key={id} className="text-xs text-gray-600 py-1">
                        {idx + 1}. {question?.question?.substring(0, 60)}...
                      </p>
                    );
                  })}
                  {selectedQuestions.size > 5 && (
                    <p className="text-xs text-gray-500 mt-1">
                      and {selectedQuestions.size - 5} more...
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleBulkDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Delete All
                  </button>
                  <button
                    onClick={cancelBulkDelete}
                    className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Table */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-6">Start adding questions to this test</p>
            <button
              onClick={() => navigate(`/manage-questions/${testId}`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto shadow-md shadow-blue-200"
            >
              <FiPlus className="w-5 h-5" />
              Add First Question
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {isBulkDeleteMode && (
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {selectedQuestions.size === questions.length ? (
                            <>
                              <FiCheckCircle className="w-5 h-5 text-blue-600" />
                              Deselect All
                            </>
                          ) : (
                            <>
                              <FiCheck className="w-5 h-5" />
                              Select All
                            </>
                          )}
                        </button>
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correct Option
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question, index) => (
                    <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                      {isBulkDeleteMode && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.has(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="line-clamp-2">{question.question}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold">
                          {getCorrectOptionLetter(question.correctOption)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiAward className="w-4 h-4 text-yellow-500" />
                          {question.marks}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(question)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {!isBulkDeleteMode && (
                            <button
                              onClick={() => handleDeleteClick(question)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer with total count */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total Questions: <span className="font-semibold text-gray-900">{questions.length}</span> | 
                  Total Marks: <span className="font-semibold text-gray-900">
                    {questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0)}
                  </span>
                </p>
                {isBulkDeleteMode && selectedQuestions.size > 0 && (
                  <p className="text-sm text-red-600">
                    Selected: {selectedQuestions.size} question(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTestQuestions;