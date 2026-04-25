import { useState } from 'react';
import { Key, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export default function EmailVerification() {
    const [code, setCode] = useState('');
    const { verifyEmail, isLoading, user } = useAuthStore();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyEmail(code);
            toast('success', 'Verified!', 'Your email has been confirmed.');
            navigate('/dashboard');
        } catch (err) {
            toast('error', 'Verification failed', err?.response?.data?.message || 'Invalid code.');
        }
    };

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase">Verify Your Email</h1>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-60">
                    We sent a code to <span className="text-orange">{user?.email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Verification Code" 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    icon={<Key size={18}/>} 
                    placeholder="123456" 
                    maxLength={6}
                    required
                />

                <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
                    Confirm Email
                </Button>
            </form>

            <button 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-orange transition-all"
            >
                Skip for now <ArrowRight size={14}/>
            </button>
        </div>
    );
}
