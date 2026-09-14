const burgerToggle = document.getElementById('burger-toggle') || document.querySelector('.burger-menu');

if (burgerToggle) {
    burgerToggle.addEventListener('click', () => {
        // Toggle 'open' for the burger animation.
        burgerToggle.classList.toggle('open');

        // Toggle 'menu-open' on body to control navbar drawer and layout shift.
        document.body.classList.toggle('menu-open');
    });

    // Close menu when a nav link is clicked.
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            burgerToggle.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    });
}