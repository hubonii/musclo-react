// Login form: collects credentials and starts an authenticated session.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
export default function LoginForm() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
    const { login, isAuthenticating } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            await login(email, password);
            toast('success', 'Welcome back!');
            navigate('/dashboard', { replace: true });
        }
        catch (err) {
            // Prefer backend message when available, otherwise fall back to generic errors.
            const message = err instanceof Error ? err.message : 'An error occurred';
            const axiosMessage = err?.response?.data?.message;
            toast('error', 'Login failed', axiosMessage || message);
        }
    };
return (<form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={18}/>} placeholder="you@example.com" required/>

            <div className="space-y-1">
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock size={18}/>} placeholder="••••••••" required/>
                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-[11px] font-black text-orange uppercase tracking-wider hover:opacity-70 transition-all">
                        Forgot Password?
                    </Link>
                </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-6" isLoading={isAuthenticating}>
                Sign In
            </Button>
        </form>);
}


