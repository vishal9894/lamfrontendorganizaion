import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { handleGetQuizQuestions, handleDeleteQuestion, handleUpdateQuestion } from "../api/allApi";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Award,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  FileQuestion,
  X,
  Save,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const ViewQuizQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correctOption: "",
    marks: 1,
    solution: "",
    category: ""
  });

  const handleGetQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await handleGetQuizQuestions(id);


      let questionsData = [];
      let quizData = null;

      if (res?.questions && Array.isArray(res.questions)) {
        questionsData = res.questions;
        quizData = res.quiz;
      } else if (res?.data?.questions && Array.isArray(res.data.questions)) {
        questionsData = res.data.questions;
        quizData = res.data.quiz;
      }

      setData(questionsData);
      setQuizInfo(quizData);
    } catch (error) {
      setError(error.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      handleGetQuestion();
    }
  }, [id]);

  // View Question
  const handleView = (question) => {
    setSelectedQuestion(question);
    setShowViewModal(true);
  };

  // Edit Question
  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setEditFormData({
      question: question.question || "",
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correctOption: question.correctOption || "",
      marks: question.marks || 1,
      solution: question.solution || "",
      category: question.category || ""
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editFormData.question.trim()) {
      setError("Question is required");
      return;
    }

    setEditLoading(true);
    setError(null);

    try {
      const updateData = {
        question: editFormData.question,
        option_a: editFormData.option_a,
        option_b: editFormData.option_b,
        option_c: editFormData.option_c,
        option_d: editFormData.option_d,
        correctOption: editFormData.correctOption,
        marks: editFormData.marks,
        solution: editFormData.solution,
        category: editFormData.category
      };

      const res = await handleUpdateQuestion(selectedQuestion.id, updateData);

      if (res?.success || res?.status === 200) {
        setSuccess("Question updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
        handleGetQuestion();
        setShowEditModal(false);
      } else {
        setError(res?.message || "Failed to update question");
      }
    } catch (err) {
      console.error("Error updating question:", err);
      setError(err.message || "Failed to update question");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Question
  const handleDelete = async () => {
    if (!selectedQuestion) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const res = await handleDeleteQuestion(selectedQuestion.id);

      if (res?.success || res?.status === 200) {
        setSuccess("Question deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
        handleGetQuestion();
        setShowDeleteModal(false);
        setSelectedQuestion(null);
      } else {
        setError(res?.message || "Failed to delete question");
      }
    } catch (err) {
      console.error("Error deleting question:", err);
      setError(err.message || "Failed to delete question");
    } finally {
      setDeleteLoading(false);
    }
  };

  const validQuestions = data.filter(q => q.question && q.question.trim() !== "");
  const totalMarks = data.reduce((sum, q) => sum + (q.marks || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Quizzes
        </button>

        {/* Quiz Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {quizInfo?.name || "Quiz Questions"}
                </h1>
                <p className="text-sm text-gray-500">Quiz ID: {id}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{data.length}</p>
                <p className="text-xs text-gray-500">Total Questions</p>
              </div>
              <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{validQuestions.length}</p>
                <p className="text-xs text-gray-500">Valid Questions</p>
              </div>
              <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{totalMarks}</p>
                <p className="text-xs text-gray-500">Total Marks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        {data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No questions found for this quiz.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((question, index) => (
                    <tr key={question.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {question.questionNumber || index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${question.question ? "text-gray-800" : "text-gray-400 italic"}`}>
                          {question.question ? (
                            question.question.length > 50
                              ? question.question.substring(0, 50) + "..."
                              : question.question
                          ) : "No question added"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {question.correctOption ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle size={12} />
                            Option {question.correctOption.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {question.marks || 0}
                      </td>
                      <td className="px-4 py-3">
                        {question.category ? (
                          <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {question.category}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(question)}
                            className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(question)}
                            className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuestion(question);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Question Details</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Question</p>
                <p className="text-gray-800 font-medium">{selectedQuestion.question || "No question added"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Option A</p>
                  <p className="text-gray-700">{selectedQuestion.option_a || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Option B</p>
                  <p className="text-gray-700">{selectedQuestion.option_b || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Option C</p>
                  <p className="text-gray-700">{selectedQuestion.option_c || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Option D</p>
                  <p className="text-gray-700">{selectedQuestion.option_d || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-green-600 mb-1">Correct Answer</p>
                  <p className="text-green-700 font-medium">
                    Option {selectedQuestion.correctOption?.toUpperCase() || "Not set"}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-orange-600 mb-1">Marks</p>
                  <p className="text-orange-700 font-medium">{selectedQuestion.marks || 0}</p>
                </div>
              </div>

              {selectedQuestion.category && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 mb-1">Category</p>
                  <p className="text-blue-700">{selectedQuestion.category}</p>
                </div>
              )}

              {selectedQuestion.solution && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 mb-1">Solution</p>
                  <p className="text-purple-700">{selectedQuestion.solution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Edit Question</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <textarea
                  name="question"
                  value={editFormData.question}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Enter question"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option A</label>
                  <input
                    type="text"
                    name="option_a"
                    value={editFormData.option_a}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option B</label>
                  <input
                    type="text"
                    name="option_b"
                    value={editFormData.option_b}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option C</label>
                  <input
                    type="text"
                    name="option_c"
                    value={editFormData.option_c}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option D</label>
                  <input
                    type="text"
                    name="option_d"
                    value={editFormData.option_d}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                  <select
                    name="correctOption"
                    value={editFormData.correctOption}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input
                    type="number"
                    name="marks"
                    value={editFormData.marks}
                    onChange={handleEditChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
                <textarea
                  name="solution"
                  value={editFormData.solution}
                  onChange={handleEditChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Solution explanation"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Delete Question</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ViewQuizQuestion;