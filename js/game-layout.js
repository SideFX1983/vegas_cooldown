/* Move game about-grid into a right column only when viewport is wide enough. */

document.addEventListener('DOMContentLoaded', () => {
    const descriptionBlock = document.getElementById('game-description-block');
    const gridSlot = document.getElementById('game-grid-slot');
    const mobileHost = document.getElementById('game-about-grid-host');
    const aboutGrid = document.getElementById('game-about-grid');

    if (!descriptionBlock || !gridSlot || !mobileHost || !aboutGrid) return;

    const wideViewport = window.matchMedia('(min-width: 1240px)');

    function updateGridPlacement() {
        if (wideViewport.matches) {
            if (aboutGrid.parentElement !== gridSlot) {
                gridSlot.appendChild(aboutGrid);
            }
            mobileHost.classList.add('is-relocated');
            return;
        }

        if (aboutGrid.parentElement !== mobileHost) {
            mobileHost.appendChild(aboutGrid);
        }
        mobileHost.classList.remove('is-relocated');
    }

    updateGridPlacement();

    if (typeof wideViewport.addEventListener === 'function') {
        wideViewport.addEventListener('change', updateGridPlacement);
    } else {
        wideViewport.addListener(updateGridPlacement);
    }
});
