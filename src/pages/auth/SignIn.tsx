import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

export function SignIn() {
  return (
    <div className="w-full max-w-md">
      <ClerkSignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-xl rounded-2xl',
            headerTitle: 'text-hw-navy-900',
            headerSubtitle: 'text-hw-navy-600',
            formButtonPrimary:
              'bg-hw-purple hover:bg-hw-purple-600 text-white',
            footerActionLink: 'text-hw-purple hover:text-hw-purple-600',
          },
        }}
      />
    </div>
  );
}
