import { useEffect, useState } from "react";
import { useQuizzes, useDeleteQuiz } from "../hooks/useOptimizedApi";
import { PAGINATION_CONFIG } from "../utils/pagination";
import {
  BookOpen,
  Clock,
  Calendar,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";

import BulkQuestionCreator from "../components/BulkQuestionCreator";
import { useNavigate } from "react-router-dom";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slideDown
      ${type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
        type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
          'bg-blue-50 text-blue-800 border-l-4 border-blue-500'}`}
    >
      <span className="text-xl">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
};

const ViewQuiz = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.QUIZZES.default);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Modal states
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestionsCount, setCurrentQuestionsCount] = useState(0);

  const navigate = useNavigate();

  // Use optimized hooks with pagination
  const { data: quizzesData, isLoading: quizzesLoading, refetch: refetchQuizzes } = useQuizzes(
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const deleteQuizMutation = useDeleteQuiz();

  const quizzes = quizzesData?.data || [];
  const pagination = quizzesData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalQuizzes = quizzesData?.total || 0;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Filter quizzes based on search
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = searchTerm === '' ||
      (quiz.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (quiz.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (quiz.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });


  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  // Handle view quiz questions - navigate to questions page
  const handleViewQuestions = (quiz) => {
    navigate(`/organization/quiz/${quiz.id}`);
  };

  // Handle edit quiz
  const handleEdit = (quiz) => {
    console.log("Edit quiz:", quiz);
    navigate(`/edit-quiz/${quiz.id}`);
  };

  // Parse categories from quiz data
  const parseQuizCategories = (quiz) => {
    const categories = [];

    // Check if quiz has questionCategory string
    if (quiz.questionCategory) {
      const categoryNames = quiz.questionCategory.split(',').map(c => c.trim()).filter(c => c);
      const totalQuestions = quiz.numberOfQuestions || 0;

      // If we have categories, distribute questions
      if (categoryNames.length > 0) {
        categoryNames.forEach((name, index) => {
          const count = quiz.categoryCounts?.[name] ||
            Math.ceil(totalQuestions / categoryNames.length);
          categories.push({ name, count: count.toString() });
        });
      }
    }

    // If no categories parsed but we have questions, create a default category
    if (categories.length === 0 && quiz.numberOfQuestions > 0) {
      categories.push({
        name: quiz.category || 'General',
        count: quiz.numberOfQuestions.toString()
      });
    }

    return categories;
  };

  // Handle add questions - uses BulkQuestionCreator for category-by-category creation
  const handleAddQuestions = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionsCount(quiz.numberOfQuestions || 0);
    setIsQuestionModalOpen(true);
  };

  // Handle delete quiz
  const handleDelete = async (quiz) => {
    if (window.confirm(`Are you sure you want to delete "${quiz.name}"? This action cannot be undone.`)) {
      try {
        await deleteQuizMutation.mutateAsync(quiz.id);
        refetchQuizzes();
        showToast("Quiz deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting quiz:", error);
        showToast("Failed to delete quiz", "error");
      }
    }
  };

  // Stats
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + (quiz.numberOfQuestions || 0), 0);
  const avgDuration = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.duration || 0), 0) / quizzes.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">


      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileQuestion className="w-8 h-8 text-indigo-600" />
                Quiz Management
              </h1>
              <p className="text-gray-600">
                View and manage all quizzes
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => refetchQuizzes()}
                disabled={quizzesLoading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${quizzesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => window.location.href = '/create-quiz'}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Create Quiz
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileQuestion className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{totalQuizzes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(avgDuration)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes by name or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {quizzesLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">
                  No quizzes found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Quizzes will appear here once they are created
                </p>
                <button
                  onClick={() => window.location.href = '/create-quiz'}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Create Your First Quiz
                </button>
              </div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">
                  No matching quizzes
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Negative Marking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <FileQuestion className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {quiz.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {quiz.id?.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {quiz.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatDuration(quiz.duration)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {quiz.numberOfQuestions || 0}
                            </span>
                            <button
                              onClick={() => handleAddQuestions(quiz)}
                              className="p-1 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                              title="Add Questions"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {quiz.negativeMarking ? (
                            <span className="inline-flex items-center gap-1 text-sm text-red-600">
                              <CheckCircle className="w-4 h-4" />
                              Yes ({quiz.negativeMarks} marks)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                              <XCircle className="w-4 h-4" />
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(quiz.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewQuestions(quiz)}
                              className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                              title="View Questions"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(quiz)}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAddQuestions(quiz)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              title="Add Questions"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(quiz)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bulk Question Creator Modal */}
      {selectedQuiz && (
        <BulkQuestionCreator
          isOpen={isQuestionModalOpen}
          onClose={() => {
            setIsQuestionModalOpen(false);
            setSelectedQuiz(null);
            refetchQuizzes();
          }}
          quizId={selectedQuiz.id}
          categories={parseQuizCategories(selectedQuiz)}
          totalQuestions={selectedQuiz.numberOfQuestions || 0}
          onComplete={() => {
            showToast("All questions created successfully!", "success");
            refetchQuizzes();
          }}
        />
      )}

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
    </div >
  );
};

export default ViewQuiz;