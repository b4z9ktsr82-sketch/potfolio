/* ==========================================================================
   SITE CONFIGURATION
   Edit these values — they are used by the contact form (contact.js) and
   the resume download button (main.js).
   ========================================================================== */
window.SITE_CONFIG = {
  // Used for the mailto fallback of the contact form.
  email: "saqib@codewithsaqib.com",

  // Form service endpoint. Leave empty ("") until you connect a service.
  // Examples (you create the form in their dashboard and paste the URL here):
  //   Formspree:  "https://formspree.io/f/xxxxxxx"
  //   Getform:    "https://getform.io/f/xxxxxxx"
  // The endpoint must accept a JSON POST and return a 2xx status on success.
  // A form endpoint URL is public by design — it is not a secret.
  formEndpoint: "",

  // Resume PDF. resume.html displays this file, and its Download/Print buttons use it.
  // To update your resume, replace the file in assets/documents/ with the SAME name.
  // (The name is case-sensitive on most web hosts; spaces are written as %20.)
  resumeUrl: "assets/documents/Saqib%20ullah%20Khan%20resume.pdf"
};
