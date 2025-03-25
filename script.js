// Carousel Functionality (Design Pages)
let currentIndex = 0;

function showMedia(index) {
  const items = document.querySelectorAll('.carousel-item');
  if (index >= items.length) currentIndex = 0;
  if (index < 0) currentIndex = items.length - 1;
  items.forEach((item, i) => {
    item.classList.toggle('active', i === currentIndex);
  });
}

function nextMedia() {
  currentIndex++;
  showMedia(currentIndex);
}

function prevMedia() {
  currentIndex--;
  showMedia(currentIndex);
}

// Single DOMContentLoaded event listener for all functionality
document.addEventListener('DOMContentLoaded', () => {
  // Carousel initialization (only for pages with a carousel)
  const carouselContainer = document.querySelector('.carousel');
  if (carouselContainer) {
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    if (prevButton && nextButton) {
      prevButton.addEventListener('click', prevMedia);
      nextButton.addEventListener('click', nextMedia);
      showMedia(currentIndex); // Ensure the first item is visible
    } else {
      console.error('Carousel buttons not found!');
    }
  }

  // Create page functionality
  const designForm = document.getElementById('design-form');
  const designGallery = document.getElementById('design-gallery');
  const loadingSpinner = document.getElementById('loading-spinner');

  if (designForm) {
    designForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const prompt = document.getElementById('design-prompt').value;
      if (!prompt) {
        alert('Please describe your design!');
        return;
      }

      loadingSpinner.style.display = 'block';

      const enhancedPrompt = `${prompt}, a fashion design on a runway with bright lights, futuristic minimalist style, high-quality, realistic, detailed`;

      try {
        const response = await fetch('https://api.getimg.ai/v1/essential-v2/text-to-image', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer key-wPExLe3kyGFTLWWXhjV8hLSMa7Nb6HYO4DJVPrklKlO7uk5pKO4fKRkSUNrGneSpuC5RTSy7aLCjIZzHlE4I8xbPIeMtlfi', // Your getimg.ai API key
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            width: 512,
            height: 512,
            output_format: 'png',
            steps: 25,
            guidance: 7.5,
          }),
        });

        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to generate image: ${response.status} - ${errorText}`);
        }

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        let imageUrl;

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          // getimg.ai typically returns a base64-encoded image in the 'image' field
          if (data.image) {
            imageUrl = `data:image/png;base64,${data.image}`;
          } else {
            throw new Error('No image data in response');
          }
        } else {
          // If it's a raw image blob
          const blob = await response.blob();
          imageUrl = URL.createObjectURL(blob);
        }

        const designItem = document.createElement('div');
        designItem.classList.add('design-item');

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Generated Design';

        const downloadBtn = document.createElement('button');
        downloadBtn.classList.add('download-btn');
        downloadBtn.textContent = 'Download';
        downloadBtn.addEventListener('click', () => {
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = 'generated-design.png';
          link.click();
        });

        designItem.appendChild(img);
        designItem.appendChild(downloadBtn);
        designGallery.appendChild(designItem);
      } catch (error) {
        console.error('Error generating design:', error);
        alert(`Failed to generate design: ${error.message}. Check the console for more details.`);
      } finally {
        loadingSpinner.style.display = 'none';
      }
    });
  }
});