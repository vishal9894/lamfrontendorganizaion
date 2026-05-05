const CourseTable = ({ courses, onCourseSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr
                key={course.id}
                onClick={() => onCourseSelect(course)}
                className="hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {course.courseImage ? (
                        <img
                          src={course.courseImage}
                          alt={course.title}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div>{course.title?.charAt(0) || "C"}</div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                        {course.title}
                      </div>
                      <div className="text-xs text-gray-500">ID: {course.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{course.currentPrice?.toLocaleString() || "0"}
                  </div>
                  {course.originalPrice && (
                    <div className="text-xs text-gray-400 line-through">
                      ₹{course.originalPrice?.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition ${course.status
                      ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                      : "bg-red-100 text-red-700 ring-1 ring-red-300"
                      }`}
                  >
                    {course.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                    View Content →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CourseTable;
