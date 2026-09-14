// Optimized Spotlight Logic
document.querySelectorAll('.acronym-block').forEach(pillar => {
    pillar.addEventListener('mousemove', e => {
        const rect = pillar.getBoundingClientRect();
        
        // Accurate coordinates relative to the pillar box
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        pillar.style.setProperty('--x', `${x}px`);
        pillar.style.setProperty('--y', `${y}px`);
    });

    pillar.addEventListener('mouseleave', () => {
        // Reset to center
        pillar.style.setProperty('--x', `50%`);
        pillar.style.setProperty('--y', `50%`);
    });
});
