'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(`メールの送信に失敗しました: ${error.message}`)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">📬</div>
        <p className="text-sm text-gray-700 font-medium">リセット用メールを送信しました</p>
        <p className="text-xs text-gray-500">
          <span className="font-medium">{email}</span> にパスワードリセット用のリンクを送信しました。
          メールをご確認ください。
        </p>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-400">
          メールが届かない場合は迷惑メールフォルダもご確認ください
        </div>
        <Link href="/login" className="block text-sm text-gray-500 hover:text-gray-900 hover:underline mt-4">
          ログインページに戻る
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        リセット用メールを送信
      </Button>
      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="text-gray-900 font-medium hover:underline">
          ログインに戻る
        </Link>
      </p>
    </form>
  )
}
