"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle } from "lucide-react"
import { toast } from 'sonner'

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SignInDialog({ open, onOpenChange, onSuccess }: SignInDialogProps) {
  const { signIn, signUp, forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password length if not in forgot password mode
    if (!isForgotPassword && password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    console.log('Attempting auth...', isSignUp ? 'signup' : 'signin');

    try {
      if (isForgotPassword) {
        await forgotPassword(email);
        toast.success('Password reset instructions have been sent to your email.');
        setIsForgotPassword(false);
        setEmail('');
        setPassword('');
      } else if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created successfully! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
        // Wait a bit for the auth state to update before calling onSuccess
        setTimeout(() => {
          onSuccess?.();
          onOpenChange(false);
        }, 100);
      }
    } catch (error: any) {
      console.error('Auth error details:', {
        error,
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      
      let errorMessage = 'Authentication failed';
      
      if (error.message.includes('Invalid email or password')) {
        errorMessage = isSignUp 
          ? 'Email already registered' 
          : 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('Network error')) {
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      } else if (error.message.includes('Invalid response')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
      
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isForgotPassword 
              ? 'Reset Password' 
              : isSignUp 
                ? 'Create an Account' 
                : 'Sign In'}
          </DialogTitle>
          <DialogDescription>
            {isForgotPassword
              ? 'Enter your email address and we\'ll send you instructions to reset your password.'
              : isSignUp 
                ? 'Create an account to like products and access your wishlist.' 
                : 'Sign in to access your account and wishlist.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              className="bg-white"
              autoComplete={isSignUp ? "new-email" : "email"}
              disabled={isLoading}
            />
          </div>
          {!isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Choose a password (min. 6 characters)" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={6}
                disabled={isLoading}
              />
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-primary text-black hover:bg-primary/90 font-semibold" 
            disabled={isLoading}
          >
            {isLoading 
              ? 'Please wait...' 
              : isForgotPassword 
                ? 'Send Reset Instructions'
                : isSignUp 
                  ? 'Create Account' 
                  : 'Sign In'}
          </Button>
          <div className="text-center space-y-2">
            {!isForgotPassword && (
              <button
                type="button"
                className="text-blue-500 hover:underline font-medium block w-full"
                onClick={() => {
                  setIsForgotPassword(true);
                  setEmail('');
                  setPassword('');
                }}
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            )}
            <button
              type="button"
              className="text-blue-500 hover:underline font-medium block w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsForgotPassword(false);
                setEmail('');
                setPassword('');
              }}
              disabled={isLoading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : isForgotPassword
                  ? 'Back to Sign In'
                  : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 