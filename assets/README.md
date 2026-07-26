# Assets Directory

Place your profile picture and any other static images or media in this folder.

### How to add your profile picture to the website permanently:
1. Copy your image file into this folder (for example: `profile.jpg` or `profile.png`).
2. In `index.html` (around line 77), update the image tag inside the profile placeholder:
   ```html
   <div class="placeholder-content">
     <!-- Remove or comment out the 'No Photo Yet' hint -->
     <!-- <span class="placeholder-hint">No Photo Yet</span> -->
     <img id="profileImage" src="assets/profile.jpg" alt="Chhom Alead" style="display: block;">
   </div>
   ```
