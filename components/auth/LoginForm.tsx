'use client'

import Link from 'next/link'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function LoginForm() {
  return (
    <div className="space-y-4">
      <GoogleSignInButton />
      <p className="text-center text-sm text-gray-500">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="text-gray-900 font-medium hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  )
}
