// Public login page with brand panel (desktop) and sign-in form.
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import { MOTION } from '../lib/motion';
import { useThemeStore } from '../stores/useThemeStore';
// Public route page that composes brand panel and login form.
export default function LoginPage() {
    const { theme } = useThemeStore();
return (<div className="min-h-screen flex flex-col md:flex-row bg-app">
            {/* Desktop-only marketing panel */}
            <div className="hidden md:flex flex-1 flex-col justify-center px-16 bg-surface relative overflow-hidden text-center md:text-left">
                <div className="relative z-10">
                    {/* Chooses light/dark logo variant from theme store value. */}
                    <img src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"} alt="MUSCLO" className="h-[54px] lg:h-24 w-auto max-w-full object-contain mb-2 mx-auto md:mx-0"/>
                    <p className="text-2xl font-medium text-text-primary mb-4">
                        Track your progress.<br />
                        Break your limits.
                    </p>
                    <p className="text-lg text-text-secondary max-w-sm">
                        AI-powered fitness logging built for those who take training seriously.
                    </p>
                </div>
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald/20 blur-[100px] rounded-full mix-blend-screen"/>
                <div className="absolute top-40 -right-20 w-80 h-80 bg-tertiary/20 blur-[100px] rounded-full mix-blend-screen"/>
            </div>
            {/* Form panel used on all breakpoints */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10">
                {/* Motion wrapper animates form entry on first render. */}
                <motion.div className="w-full max-w-sm" {...MOTION.pageEnter}>
                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
                        <p className="text-text-secondary">Enter your details to sign in to your account</p>
                    </div>

                    <LoginForm />

                    <p className="mt-8 text-center text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-emerald hover:text-emerald/80 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>);
}

