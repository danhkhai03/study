import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherLayout from './layouts/TeacherLayout';
import Dashboard from './pages/Dashboard';
import ClassManage from './pages/ClassManage';
import ClassroomManage from './pages/ClassroomManage';
import StudentManage from './pages/StudentManage';
import PetManage from './pages/PetManage';
import FrameManage from './pages/FrameManage';
import BackgroundManage from './pages/BackgroundManage';
import PointsManage from './pages/PointsManage';
import PublicClassView from './pages/PublicClassView';
import StudentShop from './pages/StudentShop';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Guest Routes - redirect to dashboard if logged in */}
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } />

            {/* Protected Teacher Routes */}
            <Route path="/teacher" element={
              <ProtectedRoute>
                <TeacherLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="classrooms" element={<ClassroomManage />} />
              <Route path="students" element={<StudentManage />} />
              <Route path="pets" element={<PetManage />} />
              <Route path="frames" element={<FrameManage />} />
              <Route path="backgrounds" element={<BackgroundManage />} />
              <Route path="points" element={<PointsManage />} />
              <Route path="class/:id" element={<ClassManage />} />
              <Route path="class/:classId/student/:studentId/shop" element={<StudentShop />} />
              <Route path="settings" element={<div className="text-gray-500">Settings coming soon...</div>} />
              <Route path="profile" element={<div className="text-gray-500">Profile coming soon...</div>} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes (TV Display) - no auth required */}
            <Route path="/public/:slug" element={<PublicClassView />} />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-gray-500 mb-4">Page not found</p>
                  <a href="/login" className="text-indigo-600 hover:text-indigo-700">Go to Login</a>
                </div>
              </div>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
