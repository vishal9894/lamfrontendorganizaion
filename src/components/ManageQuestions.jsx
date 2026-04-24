import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiPlus, FiUpload, FiCheckCircle, FiXCircle, 
  FiFileText, FiBookOpen, FiHelpCircle, FiAward, FiSave,
  FiTrash2, FiEye, FiDownload, FiFile, FiAlertCircle
} from 'react-icons/fi';
import { handleCreateTestQuestion, handleGetTests, handleGetTestQuestions, handleBulkUploadQuestions } from '../api/allApi';

function SimpleTextEditor({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);

  const insertText = (text) => {
    const el = textareaRef.current;
    if (!el) return onChange((value || '') + text);
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + text.length;
    });
  };

  return (
    <div className='border border-gray-200 rounded-xl overflow-hidden bg-white'>
      <div className='p-2 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-1'>
        <button type='button' onClick={() => insertText('∫')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-mono'>∫</button>
        <button type='button' onClick={() => insertText('∑')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-mono'>∑</button>
        <button type='button' onClick={() => insertText('√')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-mono'>√</button>
        <button type='button' onClick={() => insertText('π')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-mono'>π</button>
        <button type='button' onClick={() => insertText('²')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-mono'>x²</button>
        <button type='button' onClick={() => insertText('₂')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-mono'>H₂O</button>
        <div className='w-px h-6 bg-gray-300 mx-1'></div>
        <button type='button' onClick={() => insertText('<p>')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-xs'>&lt;p&gt;</button>
        <button type='button' onClick={() => insertText('<br/>')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-xs'>&lt;br&gt;</button>
        <button type='button' onClick={() => insertText('<strong>')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-xs'>Bold</button>
        <button type='button' onClick={() => insertText('<em>')} className='px-2 py-1 bg-white border rounded hover:bg-gray-100 text-xs'>Italic</button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className='w-full p-4 outline-none resize-y focus:ring-2 focus:ring-blue-500 transition-all'
      />
    </div>
  );
}

export default function ManageQuestions(){
  const { testId } = useParams();
  const navigate = useNavigate();
  const [categories,setCategories] = useState([]);
  const [selectedCategory,setSelectedCategory] = useState('');
  const [questionsCreated,setQuestionsCreated] = useState(0);
  const [questionsLimit,setQuestionsLimit] = useState(0);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [bulkFile,setBulkFile] = useState(null);
  const [previewQuestions,setPreviewQuestions] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const emptyForm = {
    question:'', option_a:'', option_b:'', option_c:'', option_d:'', correctOption:'', marks:'', solution:''
  };
  const [formData,setFormData] = useState(emptyForm);

  useEffect(()=>{ loadTest(); },[testId]);
  useEffect(()=>{ if(selectedCategory) loadQuestions(); },[selectedCategory]);

  async function loadTest(){
    try{
      const res = await handleGetTests(testId);
      const data = res.content || res;
      let cats = [];
      try { cats = typeof data.categories==='string' ? JSON.parse(data.categories) : (data.categories||[]); } catch {}
      const mapped = cats.filter(x=>x.category).map(x=>({name:x.category,count:Number(x.questions||0)}));
      setCategories(mapped);
      if(mapped[0]) setSelectedCategory(mapped[0].name);
    }catch(e){ setError('Failed to load test'); }
  }

  async function loadQuestions(){
    try{
      const res = await handleGetTestQuestions(testId);
      const list = res.data || res || [];
      const count = list.filter(x=>x.category===selectedCategory).length;
      setQuestionsCreated(count);
      const cat = categories.find(x=>x.name===selectedCategory);
      setQuestionsLimit(cat?.count || 0);
    }catch(e){}
  }

  function change(e){ setFormData(p=>({...p,[e.target.name]:e.target.value})); }

  async function submit(e){
    e.preventDefault();
    if(!formData.question.trim()){ setError('Question is required'); return; }
    if(!formData.option_a.trim() || !formData.option_b.trim() || !formData.option_c.trim() || !formData.option_d.trim()){
      setError('All options are required'); return;
    }
    if(!formData.correctOption){ setError('Please select correct answer'); return; }
    if(!formData.marks){ setError('Marks are required'); return; }

    setLoading(true); setError(''); setSuccess('');
    try{
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v])=>fd.append(k,v));
      fd.append('contentId',testId);
      fd.append('category',selectedCategory);
      fd.append('questionNumber', String(questionsCreated+1));
      await handleCreateTestQuestion(testId, fd);
      setSuccess('✓ Question created successfully!');
      setFormData(emptyForm);
      loadQuestions();
      setTimeout(() => setSuccess(''), 3000);
    }catch(err){ setError('Failed to create question'); }
    finally{ setLoading(false); }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if(file){
      const validTypes = ['.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop();
      if(!validTypes.includes(fileExt.toLowerCase())){
        setError('Please select a .doc or .docx file');
        return;
      }
      setBulkFile(file);
      setFileName(file.name);
      setError('');
    }
  };

  async function handleBulkUpload(){
    if(!bulkFile){ setError('Please select a .doc or .docx file first'); return; }
    try{
      setLoading(true); setError(''); setSuccess('');
      setUploadProgress(0);
      
      const fd = new FormData();
      fd.append('file', bulkFile);
      fd.append('contentId', testId);
      fd.append('category', selectedCategory);
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => prev < 90 ? prev + 10 : prev);
      }, 200);
      
      const res = await handleBulkUploadQuestions(testId, fd);
      clearInterval(interval);
      setUploadProgress(100);
      
      const questions = res?.data || res?.questions || [];
      setPreviewQuestions(Array.isArray(questions) ? questions : []);
      setSuccess(`✓ Successfully uploaded ${questions.length} questions!`);
      loadQuestions();
      setBulkFile(null);
      setFileName('');
      
      setTimeout(() => {
        setSuccess('');
        setPreviewQuestions([]);
        setUploadProgress(0);
      }, 5000);
      
    }catch(e){
      setError('Bulk upload failed. Please check file format.');
      setUploadProgress(0);
    }finally{
      setLoading(false);
    }
  }

  const clearBulkFile = () => {
    setBulkFile(null);
    setFileName('');
    setError('');
  };

  const progress = (questionsCreated/questionsLimit)*100;

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30'>
      <div className='max-w-6xl mx-auto p-6 space-y-6'>
        {/* Header */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div className='flex items-center gap-4'>
              <button 
                onClick={()=>navigate(-1)} 
                className='p-2 hover:bg-gray-100 rounded-xl transition-colors'
              >
                <FiArrowLeft className='w-6 h-6 text-gray-600' />
              </button>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>Manage Questions</h1>
                <p className='text-sm text-gray-500 mt-1'>Create and manage test questions</p>
              </div>
            </div>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200'
            >
              <FiUpload className='w-4 h-4' />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3'>
            <FiAlertCircle className='w-5 h-5 text-red-600 mt-0.5' />
            <div>
              <p className='font-medium text-red-800'>Error</p>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className='p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3'>
            <FiCheckCircle className='w-5 h-5 text-green-600 mt-0.5' />
            <div>
              <p className='font-medium text-green-800'>Success</p>
              <p className='text-sm text-green-700'>{success}</p>
            </div>
          </div>
        )}

        {/* Category Section */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <FiBookOpen className='w-5 h-5 text-blue-600' />
            <h2 className='text-lg font-semibold text-gray-900'>Category Selection</h2>
          </div>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Select Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e)=>setSelectedCategory(e.target.value)} 
                className='border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full'
              >
                {categories.map(c=>(
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className='flex justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>Progress</span>
                <span className='text-sm text-gray-600'>{questionsCreated}/{questionsLimit} questions</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div 
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500'
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Question Form */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center gap-2 mb-5'>
            <FiPlus className='w-5 h-5 text-green-600' />
            <h2 className='text-lg font-semibold text-gray-900'>Create New Question</h2>
          </div>
          
          <form onSubmit={submit} className='space-y-5'>
            {/* Question */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Question <span className='text-red-500'>*</span>
              </label>
              <SimpleTextEditor 
                value={formData.question} 
                onChange={(v)=>setFormData(p=>({...p,question:v}))} 
                placeholder='Write your question here...' 
              />
            </div>

            {/* Options */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Answer Options <span className='text-red-500'>*</span>
              </label>
              <div className='grid md:grid-cols-2 gap-4'>
                <input 
                  className='border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                  name='option_a' 
                  value={formData.option_a} 
                  onChange={change} 
                  placeholder='Option A' 
                />
                <input 
                  className='border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                  name='option_b' 
                  value={formData.option_b} 
                  onChange={change} 
                  placeholder='Option B' 
                />
                <input 
                  className='border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                  name='option_c' 
                  value={formData.option_c} 
                  onChange={change} 
                  placeholder='Option C' 
                />
                <input 
                  className='border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                  name='option_d' 
                  value={formData.option_d} 
                  onChange={change} 
                  placeholder='Option D' 
                />
              </div>
            </div>

            {/* Correct Answer & Marks */}
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Correct Answer <span className='text-red-500'>*</span>
                </label>
                <select 
                  className='border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full' 
                  name='correctOption' 
                  value={formData.correctOption} 
                  onChange={change}
                >
                  <option value=''>Select Correct Answer</option>
                  <option value='option_a'>A</option>
                  <option value='option_b'>B</option>
                  <option value='option_c'>C</option>
                  <option value='option_d'>D</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Marks <span className='text-red-500'>*</span>
                </label>
                <input 
                  className='border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full' 
                  type='number' 
                  name='marks' 
                  value={formData.marks} 
                  onChange={change} 
                  placeholder='Enter marks' 
                />
              </div>
            </div>

            {/* Solution */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Solution (Optional)
              </label>
              <SimpleTextEditor 
                value={formData.solution} 
                onChange={(v)=>setFormData(p=>({...p,solution:v}))} 
                placeholder='Add solution explanation...' 
              />
            </div>

            {/* Submit Button */}
            <button 
              type='submit' 
              disabled={loading} 
              className='w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-green-200'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className='w-5 h-5' />
                  Create Question
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bulk Upload Modal */}
        {isBulkModalOpen && (
          <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='fixed inset-0 bg-black bg-opacity-50 transition-opacity' onClick={() => setIsBulkModalOpen(false)}></div>
            <div className='flex min-h-full items-center justify-center p-4'>
              <div className='relative bg-white rounded-2xl shadow-xl max-w-2xl w-full'>
                {/* Modal Header */}
                <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-xl'>
                      <FiUpload className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <h3 className='text-xl font-semibold text-gray-900'>Bulk Upload Questions</h3>
                      <p className='text-sm text-gray-500 mt-0.5'>Upload multiple questions at once</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBulkModalOpen(false)}
                    className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <FiXCircle className='w-5 h-5' />
                  </button>
                </div>

                {/* Modal Body */}
                <div className='p-6 space-y-5'>
                  {/* Info Box */}
                  <div className='bg-blue-50 border border-blue-200 rounded-xl p-4'>
                    <div className='flex items-start gap-3'>
                      <FiFileText className='w-5 h-5 text-blue-600 mt-0.5' />
                      <div>
                        <p className='font-medium text-blue-900'>File Format Requirements</p>
                        <ul className='text-sm text-blue-800 mt-2 space-y-1'>
                          <li>• Supported format: .doc or .docx files</li>
                          <li>• Each question should be properly formatted</li>
                          <li>• Maximum file size: 10MB</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* File Input */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Select File
                    </label>
                    <div className='flex items-center gap-3'>
                      <label className='flex-1 cursor-pointer'>
                        <div className='border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors'>
                          <FiFile className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                          <p className='text-sm text-gray-600'>
                            {fileName || 'Click to select .doc or .docx file'}
                          </p>
                          <input
                            type='file'
                            accept='.doc,.docx'
                            onChange={handleFileSelect}
                            className='hidden'
                          />
                        </div>
                      </label>
                      {fileName && (
                        <button
                          type='button'
                          onClick={clearBulkFile}
                          className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        >
                          <FiTrash2 className='w-5 h-5' />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div>
                      <div className='flex justify-between mb-2'>
                        <span className='text-sm text-gray-600'>Uploading...</span>
                        <span className='text-sm text-gray-600'>{uploadProgress}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div 
                          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Preview Questions */}
                  {previewQuestions.length > 0 && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-semibold text-gray-900'>Uploaded Questions Preview</h4>
                        <span className='text-sm text-green-600'>{previewQuestions.length} questions</span>
                      </div>
                      <div className='max-h-96 overflow-y-auto space-y-3'>
                        {previewQuestions.map((q,index)=>(
                          <div key={index} className='border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow'>
                            <div className='font-medium text-gray-900 mb-2'>
                              {index + 1}. {q.question}
                            </div>
                            <div className='grid grid-cols-2 gap-2 text-sm'>
                              <div className='text-gray-600'>A. {q.option_a}</div>
                              <div className='text-gray-600'>B. {q.option_b}</div>
                              <div className='text-gray-600'>C. {q.option_c}</div>
                              <div className='text-gray-600'>D. {q.option_d}</div>
                            </div>
                            <div className='mt-2 flex items-center gap-4'>
                              <div className='text-green-600 text-sm'>✓ Correct: {q.correctOption}</div>
                              <div className='text-blue-600 text-sm'>⭐ Marks: {q.marks}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className='flex justify-end gap-3 p-6 pt-4 border-t border-gray-200'>
                  <button
                    type='button'
                    onClick={() => setIsBulkModalOpen(false)}
                    className='px-5 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={handleBulkUpload}
                    disabled={loading || !bulkFile}
                    className='px-5 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-200'
                  >
                    {loading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiUpload className='w-4 h-4' />
                        Upload File
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}