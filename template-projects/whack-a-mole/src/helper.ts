export const playSound = (audio: HTMLAudioElement | null, volume: number) => {
    if (!audio) return;

    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume;
    clone.play().catch(() => {});
}