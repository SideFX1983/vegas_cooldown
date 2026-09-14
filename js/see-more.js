/* Shared collapse/expand logic for About and Reviews pages. */

function initializePillarCardBehavior(root = document) {
    root.querySelectorAll('.about-pillar-collapsed, .about-pillar-expanded').forEach(card => {
        if (card.dataset.collapseBound === 'true') return;

        card.addEventListener('click', event => {
            const clickedElement = event.target;
            const isListItem = clickedElement.closest('li') || clickedElement.closest('.li-collapsible-item');
            const isArrow = clickedElement.classList.contains('li-toggle-arrow');
            const isToggleButton = clickedElement.classList.contains('li-toggle-btn');

            if (isListItem || isArrow || isToggleButton) return;

            const isCollapsed = card.classList.contains('about-pillar-collapsed');

            card.classList.toggle('about-pillar-collapsed', !isCollapsed);
            card.classList.toggle('about-pillar-expanded', isCollapsed);

            if (!isCollapsed) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        card.dataset.collapseBound = 'true';
    });
}

function initializePillarListItemBehavior(root = document) {
    const pillarListItems = root.querySelectorAll('.about-pillar-collapsed li, .about-pillar-expanded li');

    pillarListItems.forEach((li, index) => {
        if (li.dataset.liToggleReady === 'true') return;

        const firstLabelSpan = li.querySelector('span');
        if (!firstLabelSpan) return;

        const allNodes = Array.from(li.childNodes);
        const labelNodeIndex = allNodes.indexOf(firstLabelSpan);
        const detailsNodes = allNodes.slice(labelNodeIndex + 1);

        li.innerHTML = '';
        li.classList.add('li-collapsible-item');

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'li-toggle-btn';
        toggleButton.setAttribute('aria-expanded', 'false');

        const labelSpan = document.createElement('span');
        labelSpan.className = `li-toggle-label ${firstLabelSpan.className}`.trim();
        labelSpan.textContent = firstLabelSpan.textContent ? firstLabelSpan.textContent.trim() : '';

        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'li-toggle-arrow';
        arrowSpan.textContent = '\u25BE';
        arrowSpan.setAttribute('aria-hidden', 'true');

        toggleButton.appendChild(labelSpan);
        toggleButton.appendChild(arrowSpan);

        const detailsWrapper = document.createElement('div');
        const detailsId = `li-details-${index}`;
        detailsWrapper.className = 'li-toggle-details';
        detailsWrapper.id = detailsId;
        detailsWrapper.hidden = true;

        detailsNodes.forEach(node => detailsWrapper.appendChild(node));

        toggleButton.setAttribute('aria-controls', detailsId);

        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            toggleButton.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            detailsWrapper.hidden = isExpanded;
            li.classList.toggle('li-item-expanded', !isExpanded);
        });

        li.appendChild(toggleButton);
        li.appendChild(detailsWrapper);
        li.dataset.liToggleReady = 'true';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializePillarCardBehavior();
    initializePillarListItemBehavior();
});