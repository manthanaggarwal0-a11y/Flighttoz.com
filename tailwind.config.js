/** Build: npx tailwindcss@3.4.17 -i assets/css/input.css -o assets/css/site.css --minify */
module.exports = {
  content: ['./index.html', './assets/js/app.js'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: { brand: { 50:'#ecfeff', 100:'#cffafe', 500:'#06b6d4', 600:'#0891b2', 700:'#0e7490', 900:'#164e63' } }
    }
  }
};
