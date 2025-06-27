// Function to get CSRF token (Django specific)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken'); // Get CSRF token once on script load
console.log('[Cart.js] CSRF Token on load:', csrftoken);

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Cart.js] DOM fully loaded and parsed.');

    // Initial cart icon update (and navbar total if that function is available)
    updateCartIcon();
    if (window.updateNavbarCartTotal) { // Check if the function from main.js exists
        window.updateNavbarCartTotal();
    }

    const actionButtons = document.querySelectorAll('.add-to-cart-btn, .update-cart-btn, .delete-cart-item-btn');
    console.log('[Cart.js] Found action buttons:', actionButtons.length, actionButtons);

    if (actionButtons.length === 0) {
        console.warn("[Cart.js] No buttons found with classes: .add-to-cart-btn, .update-cart-btn, .delete-cart-item-btn. Event listeners will not be attached. Check your HTML button class names.");
    }

    actionButtons.forEach(button => {
        console.log('[Cart.js] Attaching click listener to button:', button);
        button.addEventListener('click', function() {
            console.log('[Cart.js] Button clicked:', this);
            const productId = this.dataset.product;
            const action = this.dataset.action;
            console.log('[Cart.js] Extracted - Product ID:', productId, 'Action:', action);

            let reloadPage = false;
            if (this.classList.contains('update-cart-btn') || this.classList.contains('delete-cart-item-btn')) {
                reloadPage = true;
            }

            if (productId && action) { // Ensure productId and action are defined
                console.log('[Cart.js] Proceeding to updateUserCart...');
                updateUserCart(productId, action, reloadPage);
            } else {
                console.error('[Cart.js] CRITICAL: Missing productId or action from button dataset. Button HTML:', this.outerHTML);
                alert("Error: Could not process cart action. Product data missing."); // User feedback
            }
        });
    });
});

function updateUserCart(productId, action, reloadPage = false) {
    const url = '/update_item/'; // Your Django URL for updating cart
    console.log('[Cart.js] updateUserCart called. URL:', url, 'Product ID:', productId, 'Action:', action, 'CSRF Token:', csrftoken);

    if (!csrftoken) {
        console.error("[Cart.js] CSRF token is missing. Cannot make POST request.");
        alert("A security token is missing. Please refresh the page and try again.");
        return; // Stop execution if CSRF token is missing
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken, // Use the globally obtained token
        },
        body: JSON.stringify({'productId': productId, 'action': action})
    })
    .then(response => {
        console.log('[Cart.js] Fetch response status:', response.status, response.statusText);
        if (!response.ok) {
            // Attempt to parse error response as JSON, otherwise use statusText
            return response.json().then(errData => {
                console.error('[Cart.js] Server error response data:', errData);
                throw new Error('Server error: ' + (errData.detail || errData.error || JSON.stringify(errData)));
            }).catch(() => { // If error response is not JSON
                throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('[Cart.js] Cart updated successfully. Server response data:', data);
        const cartTotalElementPage = document.getElementById('cart-total'); // For main cart display on page
        
        if (cartTotalElementPage && data.total_items !== undefined) {
            cartTotalElementPage.innerText = data.total_items;
        } else if (cartTotalElementPage) {
             // If a cart-total element exists but data.total_items is undefined, it might indicate an issue with the response.
            console.warn("[Cart.js] #cart-total element found, but total_items missing in response from /update_item/.");
        }
        // No else needed if cartTotalElementPage is null, as updateNavbarCartTotal will handle the navbar one.


        // Also update the navbar-specific cart total if the function exists
        if (window.updateNavbarCartTotal) {
            console.log("[Cart.js] Calling window.updateNavbarCartTotal()");
            window.updateNavbarCartTotal(); // This will re-fetch from /get_cart_data/ for the navbar
        } else {
            console.warn("[Cart.js] window.updateNavbarCartTotal function not found. Navbar cart total might not update automatically from here.");
        }


        if (reloadPage) {
            console.log('[Cart.js] Reloading page...');
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('[Cart.js] Error updating cart:', error.message, error);
        // Provide user feedback for critical errors
        alert('There was an error updating your cart. Please try again. Details: ' + error.message);
    });
}

function updateCartIcon() {
    const url = '/get_cart_data/'; // Your Django URL to get current cart count
    console.log('[Cart.js] updateCartIcon called. Fetching from:', url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for /get_cart_data/: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('[Cart.js] Data received from /get_cart_data/:', data);
            const cartTotalElementPage = document.getElementById('cart-total'); // For on-page cart totals
            
            if (cartTotalElementPage && data.total_items !== undefined) {
                cartTotalElementPage.innerText = data.total_items;
                console.log('[Cart.js] Page #cart-total updated. Total items:', data.total_items);
            } else if (cartTotalElementPage) {
                console.warn("[Cart.js] Page #cart-total element found, but total_items missing in response from /get_cart_data/.");
            }
            // No else needed if cartTotalElementPage is null for this specific function's primary purpose.
            // The navbar total will be handled by window.updateNavbarCartTotal separately if it exists.
        })
        .catch(e => {
            console.warn("[Cart.js] Error fetching initial cart count from /get_cart_data/:", e.message);
        });
}