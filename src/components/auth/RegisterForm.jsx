// Registration form: validates basic fields and creates a new account.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
export default function RegisterForm() {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [passwordConfirm, setPasswordConfirm] = useState('');
const [validationError, setValidationError] = useState('');
    const { register, isAuthenticating } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        // Local password confirmation check before API request.
        if (password !== passwordConfirm) {
            setValidationError('Passwords do not match');
            return;
        }
        try {

            await register(name, email, password, passwordConfirm);
            toast('success', 'Account created!', 'Please check your email for a verification code.');
            navigate('/verify-email', { replace: true });
        }
        catch (err) {
            // Error mapping order: field validation payload, response message, default message.
            const message = err instanceof Error ? err.message : 'An error occurred';
            const axiosData = err?.response?.data;
            const firstError = axiosData?.errors ? Object.values(axiosData.errors)[0]?.[0] : null;
            toast('error', 'Registration failed', firstError || axiosData?.message || message || 'Please try again.');
        }
    };
return (<form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <Input label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={18}/>} placeholder="Jane Doe" required/>

            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={18}/>} placeholder="you@example.com" required/>

            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock size={18}/>} placeholder="••••••••" required/>

            <Input label="Confirm Password" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} icon={<Lock size={18}/>} placeholder="••••••••" error={validationError} required/>

            <Button type="submit" variant="primary" className="w-full pt-2 mt-6" isLoading={isAuthenticating}>
                Sign Up
            </Button>
        </form>);
}


