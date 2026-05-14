import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center surface-page-warm">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Join Bready
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">Personal finance, baked in.</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
