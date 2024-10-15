// client.js (Frontend JavaScript Module)

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.querySelector('.sso-login-button'); // Replace with your SSO button selector
  
    if (loginButton) {
      loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/apps/sso/login'; // Redirect to app's login route
      });
    }
  
    // After Shopify login, capture session_id
    if (window.location.pathname === '/account/login') {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
  
      if (sessionId) {
        fetch('/apps/sso/login/sessionid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: sessionId })
        })
        .then(response => response.json())
        .then(data => {
          if (data.email && data.password) {
            document.getElementById('CustomerEmail').value = data.email;
            document.getElementById('CustomerPassword').value = data.password;
            document.querySelector('.login-form').submit(); // Submit Shopify login form
          } else {
            console.error('Error retrieving credentials:', data.error);
            // Handle error, e.g., display an error message
          }
        })
        .catch(error => {
          console.error('Error fetching credentials:', error);
          // Handle error
        });
      }
    }
  });
  