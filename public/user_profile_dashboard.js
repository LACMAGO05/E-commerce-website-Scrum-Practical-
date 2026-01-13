// Simulated user data (this would come from an API in a real-world scenario)
const userData = {
  name: "Ani_Zelda",
  email: "anizelda@example.com",
  profilePicture: "images/OIP.webp", // Placeholder image
  joinDate: "January 1, 2026"
};

// Function to populate user profile data
function loadUserProfile() {
  document.getElementById('userName').textContent = userData.name;
  document.getElementById('userEmail').textContent = userData.email;
  document.getElementById('userJoinDate').textContent = userData.joinDate;
  document.getElementById('profilePic').src = userData.profilePicture;
}

// Function to handle logout
document.getElementById('logoutButton').addEventListener('click', function() {
  // Simulate logging out (e.g., clearing sessionStorage or cookies in a real application)
  alert('You have been logged out.');
  // For now, just redirect to a different page
  window.location.href = 'login.html'; // Redirect to login page
});

// Load the user profile when the page is loaded
window.onload = loadUserProfile;
