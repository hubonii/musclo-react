// Profile page: user summary, achievements, and shared routine cards.
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Trophy as TrophyIcon, Share2, Dumbbell, CalendarDays, TrendingUp, Settings as SettingsIcon, Lock as LockIcon } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useProfile, useAchievements, useSharedWorkouts } from '../hooks/useProfile';
import { MOTION } from '../lib/motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LevelBadge from '../components/profile/LevelBadge';
import AchievementBadge from '../components/profile/AchievementBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import { useState } from 'react';

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const authUser = useAuthStore(s => s.user);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // `me` maps to current user profile when route param is missing.
    const resolvedUserId = id || 'me';
    
    // Hook set loads profile body, achievements, and routine cards for target user.
    const { data: profile, isLoading: isLoadingProfile } = useProfile(resolvedUserId);
    const { data: achievements = [], isLoading: isLoadingAchievements } = useAchievements(resolvedUserId);
    const { data: routines = [], isLoading: isLoadingRoutines } = useSharedWorkouts(resolvedUserId);

    // Controls owner-only actions such as navigating to editable settings.
    const isOwnProfile = !id || (authUser?.id && parseInt(id, 10) === authUser.id);

    if (isLoadingProfile) {
        // Initial profile query loading state.
return (
            <div className="min-h-screen bg-app flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" message="Preparing your profile..." />
            </div>
        );
    }

    if (!profile) {
        // API returned empty target profile.
        return <div className="text-center p-12 text-text-muted">Profile not found.</div>;
    }

return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <motion.div {...MOTION.pageEnter} className="space-y-8">
                {/* Hero card with avatar, bio, level, and profile actions. */}
                <Card className="flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald/20 to-transparent pointer-events-none"/>

                    <div className="relative z-10">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.name} className="w-28 h-28 rounded-full shadow-neu object-cover border-4 border-white" loading="lazy"/>
                        ) : (
                            <div className="w-28 h-28 rounded-full shadow-neu bg-app flex items-center justify-center border-4 border-divider">
                                <UserIcon size={48} className="text-text-muted/50"/>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">{profile.name}</h1>
                        <p className="text-text-secondary mt-1 max-w-md">{profile.bio || 'This lifter prefers to let their weights do the talking.'}</p>

                        <div className="mt-4 inline-block">
                            <LevelBadge level={profile.level?.number || 1} title={profile.level?.title || 'Beginner'} progress={profile.level?.progress || 0}/>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10 w-full md:w-auto">
                        {isOwnProfile && (
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <Button variant="secondary" className="w-full flex items-center gap-2" onClick={() => navigate('/settings')}>
                                     <SettingsIcon size={16}/> Edit Profile
                                </Button>
                                <Button variant="ghost" className="w-full flex items-center gap-2 text-[10px] font-black uppercase tracking-wider opacity-60 hover:opacity-100" onClick={() => setIsPasswordModalOpen(true)}>
                                    <LockIcon size={14}/> Change Password
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* High-level stats strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="flex flex-col items-center justify-center text-center p-8">
                        <Dumbbell className="text-tertiary mb-3 opacity-80" size={28}/>
                        <h3 className="text-5xl font-black text-text-primary tracking-tighter mb-1">
                            {profile.stats?.total_workouts || 0}
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Total Workouts</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center text-center p-8">
                        <TrendingUp className="text-emerald mb-3 opacity-80" size={28}/>
                        <h3 className="text-5xl font-black text-text-primary tracking-tighter mb-1">
                            {((profile.stats?.total_volume || 0) / 1000).toFixed(1)} <span className="text-2xl text-text-muted">t</span>
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Lifetime Volume</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center text-center p-8">
                        <CalendarDays className="text-tertiary mb-3 opacity-80" size={28}/>
                        <h3 className="text-5xl font-black text-text-primary tracking-tighter mb-1">
                            {profile.stats?.current_streak || 0} <span className="text-2xl text-text-muted">🔥</span>
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Current Streak</p>
                    </Card>
                </div>

                {/* Achievement gallery */}
                <Card>
                        <div className="flex items-center gap-3 border-b border-divider/10 pb-4 mb-6">
                        <TrophyIcon className="text-orange" size={22}/>
                        <h2 className="font-black text-text-primary text-xl uppercase tracking-tighter">Achievements</h2>
                    </div>
                    {isLoadingAchievements ? (
                        <div className="h-32 flex flex-col items-center justify-center">
                            <LoadingSpinner size="md" message="Loading achievements..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4">
                            {(achievements || []).map((ach) => (
                                <AchievementBadge key={ach.id} {...ach}/>
                            ))}
                            {(achievements || []).length === 0 && (
                                <p className="col-span-full text-center text-[10px] font-black uppercase text-text-muted py-8 tracking-widest opacity-50">No achievements yet</p>
                            )}
                        </div>
                    )}
                </Card>

                {/* Public routines section (if any) */}
                <Card>
                    <div className="flex items-center justify-between border-b border-divider/10 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <Share2 className="text-orange" size={22}/>
                            <h2 className="font-black text-text-primary text-xl uppercase tracking-tighter">Shared Routines</h2>
                        </div>
                    </div>
                    {isLoadingRoutines ? (
                        <div className="h-32 flex flex-col items-center justify-center">
                            <LoadingSpinner size="md" message="Loading routines..." />
                        </div>
                    ) : (routines || []).length === 0 ? (
                        <div className="text-center py-12 text-text-muted border-2 border-dashed border-divider/10 rounded-3xl opacity-50">
                            <Dumbbell size={32} className="mx-auto mb-3 opacity-20"/>
                            <p className="text-[10px] font-black uppercase tracking-widest">No shared routines found.</p>
                        </div>
                    ) : (
                        <div className="flex gap-4 pb-4 snap-x -mx-2 px-2 overflow-x-auto scrollbar-hide">
                            {(routines || []).map((routine) => (
                                <div key={routine.id} className="w-64 shrink-0 px-1 py-1 snap-start">
                                    <div className="bg-app shadow-neu rounded-3xl p-6 border border-divider/10 flex flex-col h-full hover:shadow-neu-orange/5 transition-all">
                                        <h3 className="font-black text-text-primary mb-2 line-clamp-1 uppercase tracking-tight">{routine.name}</h3>
                                        <p className="text-[11px] text-text-secondary mb-4 flex-1 line-clamp-2 font-medium">
                                            {routine.notes || 'No notes provided.'}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[9px] font-black bg-orange/10 px-2 py-1 rounded-md text-orange uppercase tracking-widest">
                                                {routine.exercises_count} Exercises
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

            </motion.div>

            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
}

