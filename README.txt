==========================================================================
 CODE WITH SAQIB — PORTFOLIO (https://codewithsaqib.com)
 Static website: HTML5 + CSS3 + vanilla JavaScript (+ Three.js for the 3D hero)
 No build step, no Node.js, no server-side code. Upload and it works.
==========================================================================


1. STRUCTURE
--------------------------------------------------------------------------
  index.html            Home: hero, short about, skills, projects, journey
  about.html            Biography, journey, goals, interests
  projects.html         Project list (from js/projects.js)
  project-details.html  Case study page (project-details.html?id=PROJECT-ID)
  skills.html           Skills (using / learning / coursework) + learning now
  experience.html       "Journey" page: education, certificate, roadmap
  services.html         Services that match current skills
  resume.html           Online resume + PDF download button + print
  contact.html          Contact form, email, LinkedIn
  404.html              Custom "page not found"
  robots.txt, sitemap.xml, .htaccess (hidden file — upload it too)

  css/style.css         Design tokens (colors, fonts) + all components
                        (section 22 at the bottom = Code with Saqib additions)
  js/config.js          Email, contact-form endpoint, resume PDF   <-- edit
  js/projects.js        Your projects                             <-- edit
  assets/images/        profile.jpg, og-image.jpg (share card), favicon.png
  assets/icons/         favicon.svg ("</>" brand mark)
  assets/documents/     ai-basic-course-certificate.pdf (+ your resume later)


2. ADD YOUR RESUME PDF
--------------------------------------------------------------------------
  1. Save your resume as PDF, e.g. saqibullah-khan-resume.pdf
  2. Put it in  assets/documents/
  3. In js/config.js set:
        resumeUrl: "assets/documents/saqibullah-khan-resume.pdf"
  The "PDF coming soon" button on resume.html becomes "Download resume".
  Also update "Last updated" and the online resume in resume.html if the
  content changes.


3. ADD A PROJECT
--------------------------------------------------------------------------
  Open js/projects.js. Copy the commented TEMPLATE into the PROJECTS array,
  remove the comment markers and fill in every field.
  - Screenshots go in assets/images/ (about 1600x1000, JPG, < 250 KB).
  - liveUrl / sourceUrl: leave "" until a link exists (button shows "— soon").
  - featured: true  -> also shown on the Home page.
  While the array is empty, a "First projects coming soon" message is shown.
  Optionally add project-details.html?id=YOUR-ID to sitemap.xml.


4. CONTACT FORM
--------------------------------------------------------------------------
  A static site cannot send email by itself. Out of the box, the form
  validates input and then offers an "Open email app" (mailto:) button.

  To deliver messages straight to your inbox (recommended):
  1. Create a free form at formspree.io (or Getform / Basin) using
     saqib@codewithsaqib.com as the destination.
  2. Paste its endpoint into js/config.js:
        formEndpoint: "https://formspree.io/f/xxxxxxx"
  The endpoint URL is public by design; no secret keys are needed or stored.


5. ADD MORE SOCIAL LINKS (e.g. GitHub)
--------------------------------------------------------------------------
  Search for  <div class="socials">  (footer of every page + contact.html)
  and add an <a class="social" ...> link next to the LinkedIn one.
  Add the same URL to "sameAs" in the JSON-LD block in index.html.


6. BRANDING
--------------------------------------------------------------------------
  Website logo: text mark "</>  codewith_saqib" (HTML/CSS, crisp at any size).
  The photo logo (Code with Saqib badge) is used in the social share image
  assets/images/og-image.jpg, which appears when the link is shared on
  WhatsApp, LinkedIn, etc. Colors are set in css/style.css (section 1).


7. DEPLOY TO codewithsaqib.com
--------------------------------------------------------------------------
  cPanel:
   1. Zip the CONTENTS of the "portfolio" folder (select all files inside,
      including .htaccess -> Send to -> Compressed folder).
   2. cPanel -> File Manager -> public_html -> Upload the zip -> Extract.
   3. Files must sit DIRECTLY in public_html (public_html/index.html).
   4. Enable SSL (cPanel -> SSL/TLS Status -> Run AutoSSL) so https works.
  FTP (FileZilla): upload everything inside "portfolio" to public_html,
  with hidden files shown so .htaccess is included.
  Free alternatives: Netlify / Cloudflare Pages / GitHub Pages — upload the
  folder, then point the domain's DNS at the host as they instruct.

  After going live:
  [ ] https://codewithsaqib.com loads with styles and the 3D hero
  [ ] Every menu item works; the phone menu opens and closes
  [ ] "View certificate (PDF)" opens the certificate
  [ ] Contact form: empty submit shows errors; valid submit sends / mailto
  [ ] https://codewithsaqib.com/does-not-exist shows the custom 404 page
  [ ] Sharing the link on WhatsApp shows the og-image card
  [ ] Submit sitemap.xml in Google Search Console


8. PREVIEW LOCALLY
--------------------------------------------------------------------------
  Double-click index.html, or use VS Code's "Live Server" extension for the
  most accurate preview. Hard refresh (Ctrl+F5) after changes.
  The 404 page uses <base href="/"> and only looks right on the server.
