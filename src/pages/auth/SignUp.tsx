import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

export function SignUp() {
  return (
    <div className="w-full max-w-md">
      <ClerkSignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
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
