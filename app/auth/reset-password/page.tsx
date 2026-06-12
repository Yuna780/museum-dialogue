import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">新しいパスワードを設定</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          新しいパスワードを入力してください
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
