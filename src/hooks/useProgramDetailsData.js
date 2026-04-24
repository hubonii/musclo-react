// Program details hook: load routines, search them, and handle routine deletion.
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { useToast } from '../components/ui/Toast';

// Coordinates program detail page data, search filtering, and routine deletion state.
export function useProgramDetailsData() {
    const { id: programId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [program, setProgram] = useState(null);
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteModalRoutine, setDeleteModalRoutine] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [lastLogMap, setLastLogMap] = useState({});
    // Load program details and routine list for the page.
    const fetchProgramDetails = async () => {
        if (!programId)
            return;
        try {
            const { data } = await apiClient.get(`/programs/${programId}`);
            setProgram(data.data);
            setRoutines(data.data.routines || []);
        }
        catch (err) {
            toast('error', 'Failed to load program details');
            navigate('/programs');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProgramDetails();
    }, [programId]);
    useEffect(() => {
        if (routines.length === 0)
            return;
        // Load each routine's latest workout date for "last performed" labels.
        const fetchLastLogs = async () => {
            const results = {};
            await Promise.allSettled(routines.map(async (r) => {
                try {
                    const { data } = await apiClient.get(`/routines/${r.id}/last-log`);
                    results[r.id] = data.data?.started_at || null;
                }
                catch {
                    results[r.id] = null;
                }
            }));
            setLastLogMap(results);
        };
        fetchLastLogs();
    }, [routines]);
    // Derived list updates immediately as search text changes.
    const filteredWorkouts = routines.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    const handleDeleteRoutine = async () => {
        if (!deleteModalRoutine)
            return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/routines/${deleteModalRoutine.id}`);
            toast('success', 'Routine deleted');
            setDeleteModalRoutine(null);
            fetchProgramDetails();
        }
        catch (err) {
            toast('error', 'Failed to delete routine');
        }
        finally {
            setIsDeleting(false);
        }
    };
    // Summary count used by ProgramBreakdown sidebar card.
    const totalExercises = routines.reduce((acc, r) => acc + r.exercises.length, 0);
    return {
        programId,
        program,
        routines,
        loading,
        search,
        setSearch,
        filteredWorkouts,
        deleteModalRoutine,
        setDeleteModalRoutine,
        isDeleting,
        lastLogMap,
        handleDeleteRoutine,
        totalExercises,
        fetchProgramDetails
    };
}


