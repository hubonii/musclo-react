// Exercise library page with search, category chips, and advanced filter modal.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, WifiOff } from 'lucide-react';
import { apiClient, API_URL } from '../api/axios';
import { useToast } from '../components/ui/Toast';
import { MOTION } from '../lib/motion';
import ExerciseCard from '../components/exercises/ExerciseCard';
import FilterModal from '../components/exercises/FilterModal';
import ExerciseDetailModal from '../components/exercises/ExerciseDetailModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { cn } from '../lib/utils';
import { cacheSet, cacheGet } from '../lib/offlineCache';

// Loads exercise catalog with search/chip/modal filters and shows detail modal on selection.
export default function ExercisesPage() {
const [exercises, setExercises] = useState([]);
const [loading, setLoading] = useState(true);
const [isOfflineData, setIsOfflineData] = useState(false);
    
const [search, setSearch] = useState('');
const [selectedCategory, setSelectedCategory] = useState(null); // quick filters
const [selectedBodyPart, setSelectedBodyPart] = useState(null); // advanced modal
const [selectedEquipment, setSelectedEquipment] = useState(null);
    // Selected values above feed API params for advanced filtering.
const [selectedExercise, setSelectedExercise] = useState(null);
const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    const { toast } = useToast();

useEffect(() => {
        // Debounced request pipeline for search and filter changes.
        const fetchExercises = async () => {
            setLoading(true);
            setIsOfflineData(false);
            try {
                // Server-side query handles search + selected quick/advanced filters.
                const { data } = await apiClient.get('/exercises', {
                    params: {
                        limit: 2000,
                        search: search || undefined,
                        body_part: selectedCategory || selectedBodyPart || undefined,
                        equipment: selectedEquipment || undefined
                    }
                });
                setExercises(data.data);
                // Cache the full unfiltered catalog for offline use.
                if (!search && !selectedCategory && !selectedBodyPart && !selectedEquipment) {
                    cacheSet('exercises-catalog', data.data);
                }
            } catch (err) {
                // Fall back to cached exercise catalog when the network is unavailable.
                const cached = cacheGet('exercises-catalog');
                if (cached) {
                    let filtered = cached;
                    const bp = selectedCategory || selectedBodyPart;
                    if (search) filtered = filtered.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));
                    if (bp) filtered = filtered.filter(ex => (ex.body_part || ex.muscle_group || '').toLowerCase() === bp.toLowerCase());
                    if (selectedEquipment) filtered = filtered.filter(ex => (ex.equipment || '').toLowerCase() === selectedEquipment.toLowerCase());
                    setExercises(filtered);
                    setIsOfflineData(true);
                } else {
                    toast('error', 'Failed to load exercises');
                }
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchExercises();
        }, 300);

        // Clears pending debounce timer when dependencies change quickly.
return () => clearTimeout(timeoutId);
    }, [search, selectedCategory, selectedBodyPart, selectedEquipment, toast]);

return (
        <div className="flex flex-col bg-app">
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                {/* Search bar */}
                <div className="max-w-2xl mx-auto w-full relative">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-text-muted">
                        <Search size={20} strokeWidth={2.5}/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for exercises" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="w-full h-14 pl-14 pr-6 bg-app rounded-xl text-text-primary text-sm shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-orange/30 transition-all placeholder:text-text-muted font-medium"
                    />
                </div>

                {/* Quick muscle/category chips + advanced filter button */}
                <div className="w-full hide-scrollbar flex items-center justify-between gap-3 md:gap-6 px-2 md:px-4 py-4 select-none">
                    {/* Quick filter chips are static categories mapped to icon assets. */}
                    {[ 
                        { name: 'Cardio', icon: `${API_URL}/storage/exercises/icons/ic_cardio.svg` },
                        { name: 'Chest', icon: `${API_URL}/storage/exercises/icons/ic_chest.svg` },
                        { name: 'Back', icon: `${API_URL}/storage/exercises/icons/ic_back.svg` },
                        { name: 'Biceps', icon: `${API_URL}/storage/exercises/icons/ic_biceps.svg` },
                        { name: 'Triceps', icon: `${API_URL}/storage/exercises/icons/ic_triceps.svg` },
                        { name: 'Quadriceps', icon: `${API_URL}/storage/exercises/icons/ic_quadriceps.svg` },
                        { name: 'Hamstrings', icon: `${API_URL}/storage/exercises/icons/ic_hamstrings.svg` },
                        { name: 'Shoulders', icon: `${API_URL}/storage/exercises/icons/ic_shoulders.svg` },
                        { name: 'Hips', icon: `${API_URL}/storage/exercises/icons/ic_hips.svg` },
                        { name: 'Waist', icon: `${API_URL}/storage/exercises/icons/ic_abs.svg` },
                        { name: 'Upper Arms', icon: `${API_URL}/storage/exercises/icons/ic_biceps.svg` },
                        { name: 'Calves', icon: `${API_URL}/storage/exercises/icons/ic_calves.svg` },
                        { name: 'Forearms', icon: `${API_URL}/storage/exercises/icons/ic_forearms.svg` },
                        { name: 'Neck', icon: `${API_URL}/storage/exercises/icons/ic_neck.svg` }
                    ].map((cat, idx) => (
                        <button 
                            key={`quick-filter-${cat.name}-${idx}`} 
                            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} 
                            className={cn("flex flex-col items-center gap-2 transition-all duration-300", selectedCategory === cat.name ? "opacity-100 scale-110" : "hover:-translate-y-1 opacity-70 hover:opacity-100")}
                        >
                            <div className={cn("w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl transition-all", selectedCategory === cat.name ? "bg-orange/10 shadow-neu-inset scale-105" : "")}>
                                <img 
                                    src={cat.icon} 
                                    alt={cat.name} 
                                    className={cn(
                                        "w-7 h-7 md:w-8 md:h-8 object-contain transition-all duration-300", 
                                        selectedCategory === cat.name 
                                            ? "grayscale-0 brightness-100 [filter:sepia(1)_saturate(15)_hue-rotate(335deg)]" 
                                            : "grayscale brightness-75 contrast-125 opacity-60"
                                    )} 
                                    loading="lazy" 
                                />
                            </div>
                            <span className={cn("text-[9px] md:text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-colors", selectedCategory === cat.name ? "text-orange" : "text-text-muted")}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                    <div className="w-2 md:w-4"></div>
                    <button 
                        onClick={() => setIsFilterModalOpen(true)} 
                        className={cn("flex flex-col items-center justify-center gap-2 transition-all duration-200", (selectedBodyPart || selectedEquipment) ? "opacity-100 scale-110" : "hover:-translate-y-1 opacity-70 hover:opacity-100")}
                    >
                        <div className={cn("w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-app shadow-neu", (selectedBodyPart || selectedEquipment) ? "text-orange bg-orange/5 shadow-neu-inset ring-1 ring-orange/20" : "text-text-secondary")}>
                            <SlidersHorizontal size={18}/>
                        </div>
                        <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", (selectedBodyPart || selectedEquipment) ? "text-orange" : "text-text-muted")}>
                            Filters
                        </span>
                    </button>
                </div>

                <div className="h-2"/>

                {/* Offline data indicator */}
                {isOfflineData && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-2">
                        <WifiOff size={14} className="text-amber-500 flex-shrink-0"/>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Offline — showing cached data</span>
                    </div>
                )}

                {/* Exercise result grid with loading and empty states */}
                {/* Result area branches between loading, empty, and grid states. */}
                <div className="pt-2">
                    {loading ? (
                        <LoadingSpinner size="xl" message="Loading exercises..." className="min-h-[400px] py-20" />
                    ) : exercises.length === 0 ? (
                        <EmptyState title="No exercises found" description="Try adjusting your filters or search terms."/>
                    ) : (
                        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" variants={MOTION.staggerContainer} initial="initial" animate="animate">
                            <AnimatePresence>
                                {exercises.map((ex, idx) => (
                                    <ExerciseCard key={`exercise-card-${ex.id}-${idx}`} exercise={ex} onClick={setSelectedExercise}/>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Modal stack */}
            {/* Filter modal controls advanced body-part/equipment state used in query params. */}
            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => setIsFilterModalOpen(false)} 
                selectedBodyPart={selectedBodyPart} 
                setSelectedBodyPart={setSelectedBodyPart} 
                selectedEquipment={selectedEquipment} 
                setSelectedEquipment={setSelectedEquipment}
            />
            {/* Detail modal opens when card click sets `selectedExercise`. */}
            <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)}/>
        </div>
    );
}


