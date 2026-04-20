import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  courses: [],
  stream : [] ,
  selectedCourse: null,
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourse: (state, action) => {
      state.courses = action.payload;
      
    },
    setStream: (state, action) => {
      state.stream = action.payload;
      
    },

    addCourse: (state, action) => {
      state.courses.push(action.payload);
     
    },
    updateCourse: (state, action) => {
      const index = state.courses.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = action.payload;
        
        }
    },
    deleteCourse: (state, action) => {
      state.courses = state.courses.filter(c => c.id !== action.payload);
      
    },
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      if (action.payload) toast.error(action.payload);
    },
  },
});

export const {
  setCourse,
  addCourse,
  setStream,
  updateCourse,
  deleteCourse,
  setSelectedCourse,
  setLoading,
  setError,
} = courseSlice.actions;

export default courseSlice.reducer;