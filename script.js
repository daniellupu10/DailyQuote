(function () {
  "use strict";

  /** DOM Elements **/
  const quoteTextEl = document.getElementById("quoteText");
  const quoteAuthorEl = document.getElementById("quoteAuthor");
  const quoteCardEl = document.getElementById("quoteCard");
  const newQuoteBtn = document.getElementById("newQuoteBtn");
  const customQuoteBtn = document.getElementById("customQuoteBtn");
  const fontSizeRange = document.getElementById("fontSizeRange");
  const fontSelect = document.getElementById("fontSelect");
  const bgImageInput = document.getElementById("bgImageInput");
  const bgModeSelect = document.getElementById("bgModeSelect");
  const bgColorPicker = document.getElementById("bgColorPicker");
  const textColorPicker = document.getElementById("textColorPicker");
  const downloadBtn = document.getElementById("downloadBtn");
  const shareXBtn = document.getElementById("shareXBtn");
  
  // Modal elements
  const customQuoteModal = document.getElementById("customQuoteModal");
  const customQuoteText = document.getElementById("customQuoteText");
  const customQuoteAuthor = document.getElementById("customQuoteAuthor");
  const saveCustomQuote = document.getElementById("saveCustomQuote");
  const cancelCustomQuote = document.getElementById("cancelCustomQuote");

  /** App State **/
  const quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Do not watch the clock. Do what it does. Keep going.", author: "Sam Levenson" },
    { text: "What we think, we become.", author: "Buddha" },
    { text: "Whether you think you can, or you think you can't—you're right.", author: "Henry Ford" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" }
  ];

  function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  function setQuote(q) {
    quoteTextEl.textContent = `"${q.text}"`;
    quoteAuthorEl.textContent = `— ${q.author}`;
  }

  function updateFontSize(sizePx) {
    const size = Number(sizePx);
    quoteTextEl.style.fontSize = `${size}px`;
  }

  function updateBackgroundColor(color) {
    quoteCardEl.style.backgroundColor = color;
    // Remove background image if set to ensure color is visible
    if (!quoteCardEl.style.backgroundImage) return;
  }

  function updateFontFamily(fontFamily) {
    quoteTextEl.style.fontFamily = fontFamily;
    quoteAuthorEl.style.fontFamily = fontFamily;
  }

  function updateTextColor(color) {
    quoteTextEl.style.color = color;
    quoteAuthorEl.style.color = color;
  }

  function shareToX() {
    // First generate the image
    const canvasWidth = 1200;
    const canvasHeight = 630; // Twitter's recommended aspect ratio
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background color
    const bg = getComputedStyle(quoteCardEl).backgroundColor || "#ffffff";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Background image if present
    const bgImage = quoteCardEl.dataset.bgImage;
    const bgMode = quoteCardEl.dataset.bgMode || "cover";
    
    function drawImageAndShare() {
      if (bgImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
          if (bgMode === "repeat") {
            const pattern = ctx.createPattern(img, "repeat");
            if (pattern) {
              ctx.fillStyle = pattern;
              ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            }
          } else {
            // cover
            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;
            let drawWidth, drawHeight, dx, dy;
            if (imgRatio > canvasRatio) {
              drawHeight = canvasHeight;
              drawWidth = imgRatio * drawHeight;
            } else {
              drawWidth = canvasWidth;
              drawHeight = drawWidth / imgRatio;
            }
            dx = (canvasWidth - drawWidth) / 2;
            dy = (canvasHeight - drawHeight) / 2;
            ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
          }
          drawText();
          shareImage();
        };
        img.onerror = function () {
          drawText();
          shareImage();
        };
        img.src = bgImage;
        return; // wait for image load
      }
      
      // No image case
      drawText();
      shareImage();
    }

    // Padding and layout
    const padding = 60;
    const maxTextWidth = canvasWidth - padding * 2;
    const baseFontSize = parseInt(getComputedStyle(quoteTextEl).fontSize, 10) || 28;
    const selectedFont = getComputedStyle(quoteTextEl).fontFamily || "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans'";
    const quoteFont = `${Math.round(baseFontSize * 1.8)}px ${selectedFont}`;
    const authorFont = `${Math.round(baseFontSize * 0.9)}px ${selectedFont}`;

    // Word-wrap helper
    function wrapLines(text, font, width) {
      ctx.font = font;
      const words = text.split(/\s+/);
      const lines = [];
      let current = "";
      for (let i = 0; i < words.length; i++) {
        const test = current ? current + " " + words[i] : words[i];
        const { width: w } = ctx.measureText(test);
        if (w > width && current) {
          lines.push(current);
          current = words[i];
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    // Prepare text
    const quote = quoteTextEl.textContent || "";
    const author = quoteAuthorEl.textContent || "";
    const quoteLines = wrapLines(quote.replace(/^\s+|\s+$/g, ""), quoteFont, maxTextWidth);
    const authorLines = wrapLines(author.replace(/^\s+|\s+$/g, ""), authorFont, maxTextWidth);

    const quoteLineHeight = Math.round(baseFontSize * 1.8 * 1.3);
    const authorLineHeight = Math.round(baseFontSize * 0.9 * 1.5);

    // Vertical layout
    const contentHeight = quoteLines.length * quoteLineHeight + 20 + authorLines.length * authorLineHeight;
    let y = Math.round((canvasHeight - contentHeight) / 2);

    function drawText() {
      // Draw quote
      ctx.font = quoteFont;
      ctx.fillStyle = getComputedStyle(quoteTextEl).color || "#0b0c0f";
      let yLocal = y;
      for (const line of quoteLines) {
        const metrics = ctx.measureText(line);
        const x = Math.round((canvasWidth - metrics.width) / 2);
        ctx.fillText(line, x, yLocal);
        yLocal += quoteLineHeight;
      }
      yLocal += 20; // gap
      // Author
      ctx.font = authorFont;
      ctx.fillStyle = getComputedStyle(quoteAuthorEl).color || "#666a74";
      for (const line of authorLines) {
        const metrics = ctx.measureText(line);
        const x = Math.round((canvasWidth - metrics.width) / 2);
        ctx.fillText(line, x, yLocal);
        yLocal += authorLineHeight;
      }
    }

    function shareImage() {
      canvas.toBlob(function (blob) {
        if (!blob) {
          // Fallback to text-only sharing if image generation fails
          const text = `${quote} ${author}`;
          const url = encodeURIComponent(window.location.href);
          const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
          return;
        }
        
        // Create a temporary URL for the blob
        const imageUrl = URL.createObjectURL(blob);
        
        // Create a download link for the image
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = `quote-for-twitter-${Date.now()}.png`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        
        // Share the text with the URL
        const text = `${quote} ${author}`;
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
        
        // Open Twitter share dialog
        const twitterWindow = window.open(shareUrl, '_blank', 'width=600,height=400');
        
        // Show instructions to the user
        setTimeout(() => {
          if (twitterWindow && !twitterWindow.closed) {
            // Download the image automatically
            downloadLink.click();
            
            // Show helpful message
            alert("✅ Image downloaded! Now you can:\n\n1. Click the image icon in the Twitter post\n2. Upload the downloaded image\n3. Your quote will appear with the background!\n\nThis gives you the best visual impact on Twitter.");
          }
        }, 1000);
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(imageUrl);
          document.body.removeChild(downloadLink);
        }, 2000);
        
      }, "image/png");
    }

    // Start the process
    drawImageAndShare();
  }

  // Modal functions
  function openCustomQuoteModal() {
    customQuoteModal.style.display = "block";
    customQuoteText.focus();
  }

  function closeCustomQuoteModal() {
    customQuoteModal.style.display = "none";
    customQuoteText.value = "";
    customQuoteAuthor.value = "";
  }

  function saveCustomQuoteHandler() {
    const text = customQuoteText.value.trim();
    const author = customQuoteAuthor.value.trim();
    
    if (text && author) {
      setQuote({ text, author });
      closeCustomQuoteModal();
    } else {
      alert("Please enter both quote and author.");
    }
  }

  function downloadAsPng() {
    // Canvas size (good resolution for sharing)
    const canvasWidth = 1400;
    const canvasHeight = 800;
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background color
    const bg = getComputedStyle(quoteCardEl).backgroundColor || "#ffffff";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Background image if present
    const bgImage = quoteCardEl.dataset.bgImage;
    const bgMode = quoteCardEl.dataset.bgMode || "cover";
    if (bgImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        if (bgMode === "repeat") {
          const pattern = ctx.createPattern(img, "repeat");
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }
        } else {
          // cover
          // Compute cover sizing
          const imgRatio = img.width / img.height;
          const canvasRatio = canvasWidth / canvasHeight;
          let drawWidth, drawHeight, dx, dy;
          if (imgRatio > canvasRatio) {
            drawHeight = canvasHeight;
            drawWidth = imgRatio * drawHeight;
          } else {
            drawWidth = canvasWidth;
            drawHeight = drawWidth / imgRatio;
          }
          dx = (canvasWidth - drawWidth) / 2;
          dy = (canvasHeight - drawHeight) / 2;
          ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
        }
        drawText();
        finalize();
      };
      img.onerror = function () {
        drawText();
        finalize();
      };
      img.src = bgImage;
      return; // wait for image load
    }

    // Padding and layout
    const padding = 80;
    const maxTextWidth = canvasWidth - padding * 2;
    const baseFontSize = parseInt(getComputedStyle(quoteTextEl).fontSize, 10) || 28;
    const selectedFont = getComputedStyle(quoteTextEl).fontFamily || "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans'";
    const quoteFont = `${Math.round(baseFontSize * 2)}px ${selectedFont}`;
    const authorFont = `${Math.round(baseFontSize * 1.1)}px ${selectedFont}`;

    // Text styles
    ctx.fillStyle = getComputedStyle(document.body).color || "#0b0c0f";
    ctx.textBaseline = "top";

    // Word-wrap helper
    function wrapLines(text, font, width) {
      ctx.font = font;
      const words = text.split(/\s+/);
      const lines = [];
      let current = "";
      for (let i = 0; i < words.length; i++) {
        const test = current ? current + " " + words[i] : words[i];
        const { width: w } = ctx.measureText(test);
        if (w > width && current) {
          lines.push(current);
          current = words[i];
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    // Prepare text
    const quote = quoteTextEl.textContent || "";
    const author = quoteAuthorEl.textContent || "";
    const quoteLines = wrapLines(quote.replace(/^\s+|\s+$/g, ""), quoteFont, maxTextWidth);
    const authorLines = wrapLines(author.replace(/^\s+|\s+$/g, ""), authorFont, maxTextWidth);

    const quoteLineHeight = Math.round(baseFontSize * 2 * 1.3);
    const authorLineHeight = Math.round(baseFontSize * 1.1 * 1.5);

    // Vertical layout
    const contentHeight = quoteLines.length * quoteLineHeight + 24 + authorLines.length * authorLineHeight;
    let y = Math.round((canvasHeight - contentHeight) / 2);

    function drawText() {
      // Draw quote
      ctx.font = quoteFont;
      ctx.fillStyle = getComputedStyle(quoteTextEl).color || "#0b0c0f";
      let yLocal = y;
      for (const line of quoteLines) {
        const metrics = ctx.measureText(line);
        const x = Math.round((canvasWidth - metrics.width) / 2);
        ctx.fillText(line, x, yLocal);
        yLocal += quoteLineHeight;
      }
      yLocal += 24; // gap
      // Author
      ctx.font = authorFont;
      ctx.fillStyle = getComputedStyle(quoteAuthorEl).color || "#666a74";
      for (const line of authorLines) {
        const metrics = ctx.measureText(line);
        const x = Math.round((canvasWidth - metrics.width) / 2);
        ctx.fillText(line, x, yLocal);
        yLocal += authorLineHeight;
      }
    }

    function finalize() {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `daily-quote-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, "image/png");
    }

    // No image case
    drawText();
    finalize();
  }

  /** Event wiring **/
  newQuoteBtn.addEventListener("click", () => setQuote(getRandomQuote()));
  customQuoteBtn.addEventListener("click", openCustomQuoteModal);
  fontSizeRange.addEventListener("input", (e) => updateFontSize(e.target.value));
  fontSelect.addEventListener("change", (e) => updateFontFamily(e.target.value));
  textColorPicker.addEventListener("input", (e) => updateTextColor(e.target.value));
  bgImageInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      quoteCardEl.style.backgroundImage = "";
      delete quoteCardEl.dataset.bgImage;
      quoteCardEl.style.cursor = "default";
      return;
    }
    const reader = new FileReader();
    reader.onload = function (ev) {
      const dataUrl = ev.target && ev.target.result ? String(ev.target.result) : "";
      quoteCardEl.style.backgroundImage = `url('${dataUrl}')`;
      quoteCardEl.style.backgroundSize = bgModeSelect.value === "repeat" ? "auto" : "cover";
      quoteCardEl.style.backgroundRepeat = bgModeSelect.value === "repeat" ? "repeat" : "no-repeat";
      quoteCardEl.style.backgroundPosition = "center";
      quoteCardEl.dataset.bgImage = dataUrl;
      quoteCardEl.dataset.bgMode = bgModeSelect.value;
      
      // Enable drag functionality for cover mode
      if (bgModeSelect.value === "cover") {
        quoteCardEl.style.cursor = "grab";
        quoteCardEl.title = "Drag to reposition background image";
      }
    };
    reader.readAsDataURL(file);
    // Clear the input value to hide filename
    e.target.value = "";
  });
  bgModeSelect.addEventListener("change", () => {
    const mode = bgModeSelect.value;
    quoteCardEl.style.backgroundSize = mode === "repeat" ? "auto" : "cover";
    quoteCardEl.style.backgroundRepeat = mode === "repeat" ? "repeat" : "no-repeat";
    quoteCardEl.style.backgroundPosition = "center";
    quoteCardEl.dataset.bgMode = mode;
    
    // Update cursor and drag functionality
    if (mode === "cover" && quoteCardEl.style.backgroundImage) {
      quoteCardEl.style.cursor = "grab";
      quoteCardEl.title = "Drag to reposition background image";
    } else {
      quoteCardEl.style.cursor = "default";
      quoteCardEl.title = "";
    }
  });
  bgColorPicker.addEventListener("input", (e) => updateBackgroundColor(e.target.value));
  downloadBtn.addEventListener("click", downloadAsPng);
  shareXBtn.addEventListener("click", shareToX);

  // Modal event listeners
  saveCustomQuote.addEventListener("click", saveCustomQuoteHandler);
  cancelCustomQuote.addEventListener("click", closeCustomQuoteModal);
  
  // Close modal when clicking outside
  customQuoteModal.addEventListener("click", (e) => {
    if (e.target === customQuoteModal) {
      closeCustomQuoteModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && customQuoteModal.style.display === "block") {
      closeCustomQuoteModal();
    }
  });

  // Drag and drop functionality for background image positioning
  let isDragging = false;
  let startX, startY, startPosX, startPosY;

  quoteCardEl.addEventListener("mousedown", (e) => {
    if (quoteCardEl.dataset.bgMode === "cover" && quoteCardEl.style.backgroundImage) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      // Get current background position
      const currentPos = quoteCardEl.style.backgroundPosition || "center center";
      const [posX, posY] = currentPos.split(" ");
      startPosX = posX;
      startPosY = posY;
      
      quoteCardEl.style.cursor = "grabbing";
      e.preventDefault();
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Convert pixel movement to percentage
      const cardRect = quoteCardEl.getBoundingClientRect();
      const percentX = (deltaX / cardRect.width) * 100;
      const percentY = (deltaY / cardRect.height) * 100;
      
      // Calculate new position
      const newPosX = 50 + percentX;
      const newPosY = 50 + percentY;
      
      quoteCardEl.style.backgroundPosition = `${newPosX}% ${newPosY}%`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      quoteCardEl.style.cursor = "grab";
    }
  });

  // Initialize
  updateFontSize(fontSizeRange.value);
  updateBackgroundColor(bgColorPicker.value);
  updateFontFamily(fontSelect.value);
  updateTextColor(textColorPicker.value);
  // Randomize on first load for fun
  setQuote(getRandomQuote());
})();


