document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const cartTotalNav = document.getElementById('cart-total');

    // Mobile Navbar Toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                navToggle.setAttribute('aria-expanded', 'true');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // User Dropdown Toggle for Mobile (and click on desktop if preferred)
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(event) {
                // For mobile, prevent default and toggle.
                // For desktop, CSS handles hover, but click can also toggle if that's desired.
                // If you want ONLY hover on desktop and ONLY click on mobile:
                if (window.innerWidth <= 992) {
                    event.preventDefault(); // Prevent <a> tag navigation if it's a link
                    // Close other active dropdowns first if multiple exist
                    dropdowns.forEach(d => {
                        if (d !== dropdown && d.classList.contains('active')) {
                            d.classList.remove('active');
                        }
                    });
                    dropdown.classList.toggle('active');
                } else {
                    // Optional: if you want desktop click to also work (alongside hover)
                    // event.preventDefault();
                    // dropdown.classList.toggle('active');
                }
            });
        }
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', function(event) {
        dropdowns.forEach(dropdown => {
            // Check if the click is outside the dropdown itself AND outside its toggle
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (!dropdown.contains(event.target) && (!toggle || !toggle.contains(event.target)) && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });

        // Also close mobile nav if click is outside nav links and toggle button
        if (navLinks && navLinks.classList.contains('active')) {
            if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
                navLinks.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });


    // Function to update cart total in navbar
    function updateNavbarCartTotal() {
        if (!cartTotalNav) return;

        fetch('/get_cart_data/')
            .then(response => {
                if (!response.ok) {
                    console.warn('Network response was not ok for cart data');
                    return { total_items: '0' }; // Default to 0 on error
                }
                return response.json();
            })
            .then(data => {
                if (data.total_items !== undefined) {
                    cartTotalNav.innerText = data.total_items;
                } else {
                    cartTotalNav.innerText = '0';
                }
            }).catch(e => {
                console.warn("Error fetching initial cart count for navbar:", e);
                cartTotalNav.innerText = '0';
            });
    }

    // Call it on initial load
    updateNavbarCartTotal();
    window.updateNavbarCartTotal = updateNavbarCartTotal; // Make globally accessible for cart.js


    // Close messages
    const closeMessageButtons = document.querySelectorAll('.close-message');
    closeMessageButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
});