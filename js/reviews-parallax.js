/* Reviews page fixed tiled background. */

const REVIEWS_TILE_WIDTH = 63;
const REVIEWS_TILE_HEIGHT = 95;
const REVIEWS_TILE_GAP = 100;

function initializeReviewsParallaxBackground() {
    const layer = document.getElementById('reviews-parallax-bg');
    if (!layer) return;

    function renderTiles() {
        const cellWidth = REVIEWS_TILE_WIDTH + REVIEWS_TILE_GAP;
        const cellHeight = REVIEWS_TILE_HEIGHT + REVIEWS_TILE_GAP;
        const rows = Math.ceil(window.innerHeight / cellHeight) + 2;
        const columns = Math.ceil(window.innerWidth / cellWidth) + 3;

        layer.innerHTML = '';

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const tile = document.createElement('img');

                tile.src = 'img/bg_tile.png';
                tile.alt = '';
                tile.className = 'reviews-parallax-tile';
                tile.style.left = `${column * cellWidth}px`;
                tile.style.top = `${row * cellHeight}px`;

                layer.appendChild(tile);
            }
        }
    }

    renderTiles();
    window.addEventListener('resize', renderTiles);
}

document.addEventListener('DOMContentLoaded', initializeReviewsParallaxBackground);
