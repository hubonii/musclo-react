// Settings page for preferences (units/theme/timer) and CSV export.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Download, Shield, Moon, Sun, Monitor, Clock, Globe } from 'lucide-react';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { useThemeStore } from '../stores/useThemeStore';
import { MOTION } from '../lib/motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../api/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
export default function SettingsPage() {
    const { data: settings, isLoading: loading } = useSettings();
    const updateSettings = useUpdateSettings();
    const { toast } = useToast();
const [unitSystem, setUnitSystem] = useState('metric');
const [isExporting, setIsExporting] = useState(false);
useEffect(() => {
        // Hydrates local form state from fetched server settings once loaded.
        if (settings) {
            setUnitSystem(settings.unit_system);
        }
    }, [settings]);
    const handleSave = () => {
        // Sends current form values as partial update payload.
        updateSettings.mutate({
            unit_system: unitSystem,
        }, {
            onSuccess: () => toast('success', 'Settings saved successfully.'),
            onError: () => toast('error', 'Failed to save settings.'),
        });
    };
    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Requests CSV as blob and triggers browser download via temporary anchor.
            const response = await apiClient.get('/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `musclo_workout_data_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast('success', 'Data exported successfully.');
        }
        catch (err) {
            toast('error', 'Failed to export data.');
        }
        finally {
            // Always release exporting state so button can be used again.
            setIsExporting(false);
        }
    };
    if (loading) {
        // Initial load branch while settings query is in-flight.
return (<div className="min-h-screen bg-app flex flex-col items-center justify-center">
                <LoadingSpinner size="lg"/>
                <p className="mt-4 text-text-muted italic font-medium">Loading settings...</p>
            </div>);
    }
return (<div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
            <motion.div {...MOTION.pageEnter} className="space-y-6">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">Settings</h1>
                        <p className="text-text-secondary mt-1 text-sm">Manage your preferences, account, and data.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Preferences card */}
                    <Card className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 pb-4">
                            <Settings className="text-tertiary" size={20}/>
                            <h2 className="font-bold text-lg text-text-primary">Preferences</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-text-secondary mb-3">
                                    <Globe size={16}/> Unit System
                                </label>
                                <div className="flex bg-divider/10 rounded-2xl p-1 shadow-neu-inset w-full max-w-xs">
                                    <button onClick={() => setUnitSystem('metric')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${unitSystem === 'metric' ? 'bg-app shadow-neu text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                                        Metric (kg)
                                    </button>
                                    <button onClick={() => setUnitSystem('imperial')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${unitSystem === 'imperial' ? 'bg-app shadow-neu text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                                        Imperial (lbs)
                                    </button>
                                </div>
                            </div>

                                 <div className="pt-4 flex justify-end">
                                    <Button variant="primary" onClick={handleSave} disabled={updateSettings.isPending}>
                                        <Save size={16} className="mr-2"/>
                                        {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
                                    </Button>
                                </div>
                            </div>
                    </Card>

                    {/* Data export card */}
                    <div className="space-y-6">
                        <Card>
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="text-tertiary" size={20}/>
                                <h2 className="font-bold text-lg text-text-primary">Data & Privacy</h2>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6">
                                Your data belongs to you. Export your entire workout logging history as a CSV spreadsheet at any time.
                            </p>
                            <Button variant="secondary" className="w-full flex justify-center items-center gap-2" onClick={handleExport} disabled={isExporting}>
                                <Download size={16}/>
                                {isExporting ? 'Exporting...' : 'Export Workout Data'}
                            </Button>
                        </Card>
                    </div>

                </div>
            </motion.div>
        </div>);
}


