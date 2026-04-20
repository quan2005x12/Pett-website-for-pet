import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] bg-[#f6f6f7] px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-500">
          Đang tải thông tin tài khoản...
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#f6f6f7] px-4 py-12">
      <section className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-8">
          Hồ sơ tài khoản
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-20 h-20 rounded-full border border-slate-200 object-cover"
          />
          <div>
            <p className="text-xl font-bold text-slate-900">{user.displayName}</p>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
        >
          Đăng xuất
        </button>
      </section>
    </div>
  )
}
