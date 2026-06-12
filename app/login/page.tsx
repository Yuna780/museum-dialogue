import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { reset?: string; error?: string }
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">ログイン</h1>
        {searchParams.reset === 'success' && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            パスワードを更新しました。新しいパスワードでログインしてください。
          </div>
        )}
        {searchParams.error === 'auth' && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            認証に失敗しました。もう一度お試しください。
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
