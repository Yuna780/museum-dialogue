import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">パスワードをリセット</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          登録済みのメールアドレスにリセット用のリンクを送信します
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
