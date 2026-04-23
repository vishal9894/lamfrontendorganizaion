import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    <div className='border rounded-xl overflow-hidden bg-white'>
      <div className='p-2 border-b flex gap-2'>
        <button type='button' onClick={() => insertText('∫')}>∫</button>
        <button type='button' onClick={() => insertText('∑')}>∑</button>
        <button type='button' onClick={() => insertText('√')}>√</button>
        <button type='button' onClick={() => insertText('π')}>π</button>
        <button type='button' onClick={() => insertText('²')}>x²</button>
        <button type='button' onClick={() => insertText('₂')}>H₂O</button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className='w-full p-3 outline-none resize-y'
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
    setLoading(true); setError(''); setSuccess('');
    try{
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v])=>fd.append(k,v));
      fd.append('contentId',testId);
      fd.append('category',selectedCategory);
      fd.append('questionNumber', String(questionsCreated+1));
      await handleCreateTestQuestion(testId, fd);
      setSuccess('Question created successfully');
      setFormData(emptyForm);
      loadQuestions();
    }catch(err){ setError('Failed to create question'); }
    finally{ setLoading(false); }
  }

  async function handleBulkUpload(){
    if(!bulkFile){ setError('Select .doc or .docx file first'); return; }
    try{
      setLoading(true); setError(''); setSuccess('');
      const fd = new FormData();
      fd.append('file', bulkFile);
      fd.append('contentId', testId);
      fd.append('category', selectedCategory);
      const res = await handleBulkUploadQuestions(testId, fd);
      const questions = res?.data || res?.questions || [];
      setPreviewQuestions(Array.isArray(questions) ? questions : []);
      setSuccess('Bulk questions uploaded successfully');
      loadQuestions();
    }catch(e){
      setError('Bulk upload failed');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className='max-w-5xl mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Manage Questions</h1>
        <button onClick={()=>navigate(-1)} className='px-4 py-2 bg-gray-200 rounded'>Back</button>
      </div>

      {error && <div className='p-3 bg-red-100 text-red-700 rounded'>{error}</div>}
      {success && <div className='p-3 bg-green-100 text-green-700 rounded'>{success}</div>}

      <div className='bg-white rounded-xl shadow p-4'>
        <label className='block mb-2 font-medium'>Category</label>
        <select value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)} className='border p-2 rounded w-full'>
          {categories.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <p className='mt-2 text-sm text-gray-600'>Progress: {questionsCreated}/{questionsLimit}</p>
      </div>

      <div className='bg-white rounded-xl shadow p-4 space-y-3'>
        <h2 className='font-semibold'>Bulk Upload Questions (.doc/.docx)</h2>
        <input type='file' accept='.doc,.docx' onChange={(e)=>setBulkFile(e.target.files?.[0] || null)} />
        <button type='button' disabled={loading} onClick={handleBulkUpload} className='px-4 py-2 bg-blue-600 text-white rounded'>{loading ? 'Uploading...' : 'Upload File'}</button>
      </div>

      {previewQuestions.length > 0 && (
        <div className='bg-white rounded-xl shadow p-4 space-y-4'>
          <h2 className='font-semibold text-lg'>Uploaded Questions Preview</h2>
          {previewQuestions.map((q,index)=>(
            <div key={index} className='border rounded p-4 space-y-1'>
              <div className='font-semibold'>{index + 1}. {q.question}</div>
              <div>A. {q.option_a}</div>
              <div>B. {q.option_b}</div>
              <div>C. {q.option_c}</div>
              <div>D. {q.option_d}</div>
              <div className='text-green-600'>Correct: {q.correctOption}</div>
              <div className='text-sm text-gray-500'>Marks: {q.marks}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className='bg-white rounded-xl shadow p-4 space-y-4'>
        <SimpleTextEditor value={formData.question} onChange={(v)=>setFormData(p=>({...p,question:v}))} placeholder='Write question here...' />
        <div className='grid md:grid-cols-2 gap-3'>
          <input className='border p-2 rounded' name='option_a' value={formData.option_a} onChange={change} placeholder='Option A' />
          <input className='border p-2 rounded' name='option_b' value={formData.option_b} onChange={change} placeholder='Option B' />
          <input className='border p-2 rounded' name='option_c' value={formData.option_c} onChange={change} placeholder='Option C' />
          <input className='border p-2 rounded' name='option_d' value={formData.option_d} onChange={change} placeholder='Option D' />
        </div>
        <div className='grid md:grid-cols-2 gap-3'>
          <select className='border p-2 rounded' name='correctOption' value={formData.correctOption} onChange={change}>
            <option value=''>Select Correct Answer</option>
            <option value='option_a'>A</option><option value='option_b'>B</option><option value='option_c'>C</option><option value='option_d'>D</option>
          </select>
          <input className='border p-2 rounded' type='number' name='marks' value={formData.marks} onChange={change} placeholder='Marks' />
        </div>
        <SimpleTextEditor value={formData.solution} onChange={(v)=>setFormData(p=>({...p,solution:v}))} placeholder='Solution (optional)' />
        <button disabled={loading} className='px-5 py-2 bg-green-600 text-white rounded'>{loading?'Saving...':'Create Question'}</button>
      </form>
    </div>
  );
}
