const fs = require('fs');
const path = require('path');

const backupPath = 'app/admin/dashboard/page.tsx.backup';
const outputPath = 'app/admin/dashboard/page.tsx';

if (!fs.existsSync(backupPath)) {
    console.error('Backup file missing!');
    process.exit(1);
}

const content = fs.readFileSync(backupPath, 'utf8');

// Find handleSave start
const startMarker = 'const handleSave = async () => {';
const startIndex = content.indexOf(startMarker);

// Find main return start (the one after isLoadingData block)
const isLoadingDataSearch = 'if (isLoadingData) {';
const isLoadingDataIndex = content.indexOf(isLoadingDataSearch);
const mainReturnIndex = content.indexOf('return (', isLoadingDataIndex + 20);

if (startIndex === -1 || isLoadingDataIndex === -1 || mainReturnIndex === -1) {
    console.error('Markers not found:', { startIndex, isLoadingDataIndex, mainReturnIndex });
    process.exit(1);
}

const cleanBlock = `const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        const saves = [
            { type: 'profile', data: localProfile },
            { type: 'skills', data: localSkills },
            { type: 'projects', data: localProjects },
            { type: 'achievements', data: localAchievements },
            { type: 'badges', data: localBadges },
        ];

        try {
            for (const save of saves) {
                const res = await fetch('/api/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(save),
                });
                const result = await res.json();
                if (!result.success) {
                    throw new Error(result.message || \`Failed to sync \${save.type}\`);
                }
            }

            setSaveStatus({
                type: 'success',
                message: 'All changes have been successfully saved to the database. PLEASE REFRESH YOUR HOMEPAGE to see the changes.',
            });
            window.open('/', '_blank');
        } catch (err) {
            console.error('Save error:', err);
            setSaveStatus({ type: 'error', message: err.message || 'Error during synchronization.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#030711] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 animate-pulse">Initializing Secure Session</p>
                </div>
            </div>
        );
    }

    `;

const finalContent = content.substring(0, startIndex) + cleanBlock + content.substring(mainReturnIndex);

// Also fix the weird spaces at the end of tags if they exist
const polishedContent = finalContent
    .replace(/<\/main >/g, '</main>')
    .replace(/<\/div >/g, '</div>');

fs.writeFileSync(outputPath, polishedContent, 'utf8');
console.log('File patched successfully with guaranteed clean logic block');
