const client = new Appwrite.Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject('6667eeee0023990241a3'); // Your project ID

const account = new Appwrite.Account(client);

function loginWithGoogle() {
  account.createOAuth2Session('google', 'http://localhost:3001/')
    .then(response => {
      console.log('Login successful:', response);
      setTimeout(fetchUserDetails, 2000); // Delay to allow session creation
    })
    .catch(error => {
      console.error('Login failed:', error);
    });
}

function fetchUserDetails() {
  account.get()
    .then(response => {
      console.log('User details:', response);
      localStorage.setItem('user', JSON.stringify(response)); // Store user details locally
      updateUserUI(response); // Update the UI with user details
      createUserTables(response.name); // Create user-specific tables
    })
    .catch(error => {
      console.error('Failed to get user details:', error);
    });
}

function updateUserUI(user) {
  const loginButton = document.querySelector('#loginBtn');
  const userMenu = document.createElement('div');
  userMenu.classList.add('dropdown');
  userMenu.innerHTML = `
    <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      ${user.name}
    </button>
    <div class="dropdown-menu" aria-labelledby="userDropdown">
      <a class="dropdown-item" href="#">Profile</a>
      <a class="dropdown-item" href="#" id="logoutBtn">Logout</a>
    </div>
  `;

  loginButton.replaceWith(userMenu);

  // Add logout functionality
  document.querySelector('#logoutBtn').addEventListener('click', logout);
}

function logout() {
  account.deleteSession('current')
    .then(() => {
      console.log('Logged out successfully');
      localStorage.removeItem('user'); // Remove user details from local storage
      location.reload(); // Reload the page to show the login button again
    })
    .catch(error => {
      console.error('Logout failed:', error);
    });
}

function createUserTables(username) {
  const sanitizedUsername = username.replace(/\s+/g, '_');
  fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: sanitizedUsername, password: 'dummy_password' }) // Adjust password handling as needed
  })
    .then(res => res.json())
    .then(data => {
      console.log('Tables created or already exist:', data);
    })
    .catch(error => {
      console.error('Error creating tables:', error);
    });
}

function checkLoginStatus() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('login-modal.html')
    .then(response => response.text())
    .then(data => {
      document.body.insertAdjacentHTML('beforeend', data);
      $('#authModal').modal({ show: false });

      document.querySelector('#loginBtn').addEventListener('click', function () {
        $('#authModal').modal('show');
      });

    })
    .catch(error => console.error('Error loading login modal:', error));

  // Check if the user is already logged in
  const user = checkLoginStatus();
  if (user) {
    updateUserUI(user);
  } else {
    // Try to refresh session in case it exists but isn't in localStorage
    account.get()
      .then(response => {
        localStorage.setItem('user', JSON.stringify(response));
        updateUserUI(response);
      })
      .catch(error => {
        console.log('No active session found');
      });
  }
});
