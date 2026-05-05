import { useState, useEffect } from "react";
import {
  handleCreateBulkQuestion,
  handleGetBulkQuestion,
  handleDeleteBulkQuestion,
  handleDeleteAllBulkQuestions
} from "../api/allApi";
import DeleteModal from "../components/DeleteModal";

const ImportBulkTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [questions, setQuestions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteMode, setDeleteMode] = useState("single"); // "single" or "all"

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile || null);
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleUpload = async () => {
    if (!file) {
      showMessage("Please select a Word file to upload.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setMessage("");

      const response = await handleCreateBulkQuestion(formData);


      if (response && response.success) {
        showMessage(
          `Upload successful! ${response.inserted || response.data?.inserted || 0} questions added.`,
          "success",
        );
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
        await fetchQuestions();
      } else {
        showMessage(response?.message || "Upload failed", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showMessage(
        "Upload failed: " + (error.message || "Unknown error"),
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);

      const response = await handleGetBulkQuestion();


      // Handle different response structures
      let questionsData = [];

      if (response) {
        // Case 1: { success: true, questions: [...] }
        if (response.questions && Array.isArray(response.questions)) {
          questionsData = response.questions;
        }
        // Case 2: { success: true, data: [...] }
        else if (response.data && Array.isArray(response.data)) {
          questionsData = response.data;
        }
        // Case 3: { data: { questions: [...] } }
        else if (response.data?.questions && Array.isArray(response.data.questions)) {
          questionsData = response.data.questions;
        }
        // Case 4: Direct array
        else if (Array.isArray(response)) {
          questionsData = response;
        }
        // Case 5: Response has question property (your backend might use this)
        else if (response.question && Array.isArray(response.question)) {
          questionsData = response.question;
        }
      }

      setQuestions(questionsData);

      if (questionsData.length === 0) {
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showMessage("Failed to fetch questions.", "error");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    const question = questions.find(q => q.id === id);
    setSelectedQuestion(question);
    setDeleteMode("single");
    setShowDeleteModal(true);
  };

  const handleDeleteAll = async () => {
    setDeleteMode("all");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      let response;

      if (deleteMode === "single" && selectedQuestion) {
        response = await handleDeleteBulkQuestion(selectedQuestion.id);

        if (response && response.success) {
          showMessage("Question deleted successfully.", "success");
          fetchQuestions();
        } else {
          showMessage(response?.message || "Failed to delete question.", "error");
        }
      } else if (deleteMode === "all") {
        response = await handleDeleteAllBulkQuestions();

        if (response && response.success) {
          showMessage("All questions deleted successfully.", "success");
          fetchQuestions();
        } else {
          showMessage(response?.message || "Failed to delete all questions.", "error");
        }
      }

      setShowDeleteModal(false);
      setSelectedQuestion(null);
      setDeleteMode("single");
    } catch (error) {
      console.error("Delete error:", error);
      showMessage(`Failed to delete ${deleteMode === "all" ? "all questions" : "question"}.`, "error");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedQuestion(null);
    setDeleteMode("single");
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className=" bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Import Bulk Test
              </h1>
              <p className="text-gray-500 mt-1">
                Upload Word files and manage MCQ questions easily.
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">
                Total Questions: {questions.length}
              </div>
              <button
                onClick={fetchQuestions}
                disabled={loadingQuestions}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loadingQuestions ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Upload Word File
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-center">
            <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
              <div className="text-center px-4">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-700 font-medium">
                  Click to choose a Word file
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: .doc, .docx
                </p>
                {file && (
                  <p className="mt-3 text-sm font-semibold text-blue-700 break-all">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept=".doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="h-12 px-6 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={questions.length === 0 || loadingQuestions}
              className="h-12 px-6 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              Delete All
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium border ${messageType === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
                }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Imported Questions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Review all uploaded MCQ entries below.
              </p>
            </div>
          </div>

          {loadingQuestions ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
              <p>Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-600 font-medium">No questions found.</p>
              <p className="text-sm text-gray-500 mt-1">
                Upload a Word file to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-md transition"
                >
                  {/* Question in original format */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {index + 1}. {q.question || q.question_text || "No question text"}
                    </h3>
                  </div>

                  {/* Options in original format */}
                  <div className="space-y-2 mb-4 pl-4">
                    <div className="text-gray-700">(a) {q.option_a || q.a || "N/A"}</div>
                    <div className="text-gray-700">(b) {q.option_b || q.b || "N/A"}</div>
                    <div className="text-gray-700">(c) {q.option_c || q.c || "N/A"}</div>
                    <div className="text-gray-700">(d) {q.option_d || q.d || "N/A"}</div>
                    {(q.option_e || q.e) && <div className="text-gray-700">(e) {q.option_e || q.e}</div>}
                  </div>

                  {/* Answer */}
                  <div className="flex items-center justify-between">
                    <div className="text-green-700 font-medium">
                      Answer: {q.correct_answer || q.answer || "N/A"}
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm"
                    >
                      Delete Question
                    </button>
                  </div>

                  {/* Debug info - remove in production */}
                  <div className="mt-2 text-xs text-gray-400 border-t pt-2">
                    <details>
                      <summary>Debug Info</summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(q, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={deleteMode === "all" ? "Delete All Questions" : "Delete Question"}
        message={deleteMode === "all"
          ? "Are you sure you want to delete ALL questions? This action cannot be undone."
          : `Are you sure you want to delete this question?`}
        itemName={deleteMode === "all" ? "All Questions" : selectedQuestion?.questionText || "Question"}
        confirmText="Delete"
        cancelText="Cancel"
        size="md"
      />
    </div>
  );
};

export default ImportBulkTest;