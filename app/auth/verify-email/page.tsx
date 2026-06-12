export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-6">✉️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">メールを確認してください</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          確認メールを送信しました。<br />
          メール内のリンクをクリックして、アカウントを有効化してください。
        </p>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-400">
          メールが届かない場合は迷惑メールフォルダもご確認ください
        </div>
      </div>
    </div>
  )
}
