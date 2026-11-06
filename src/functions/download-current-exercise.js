import { logActivity } from './log-activity.js';

export async function downloadCurrentExercise(client, pointerEvent, exercise, toast) {
    await logActivity(client, 'download', pointerEvent.target.id);
    const { data: files, error: getError } = await client
        .from('downloads')
        .select()
        .filter('file_path', 'like', `${exercise}%`);

    if (getError) {
        toast.show('Error during getting file list.');
        return;
    }

    const paths = files.map(f => f.file_path)
    const { data, error: downloadError } = await client.storage
        .from('Downloads')
        .createSignedUrls(paths, 60);

    if (downloadError) {
        toast.show('Error during downloading files.');
        return;
    }

    data.forEach((item, index) => {
        if (!item.signedUrl) {
            toast.show(`Error downloading ${item.path}: ${item.error}`);
            return;
        }

        setTimeout(() => {
            const link = document.createElement('a');
            link.href = item.signedUrl;
            link.download = item.path.split('/').pop() || 'plik';
            if (link.href.includes('pdf'))
                link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 1000);
    });
}