// Custom Select Component for better styling
class CustomSelect {
  constructor(selectElement) {
    this.select = selectElement;
    this.wrapper = null;
    this.init();
  }

  init() {
    // Hide original select
    this.select.style.display = 'none';
    
    // Create custom select
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'custom-select-wrapper relative';
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'flex h-9 w-full items-center justify-between rounded-md border border-border bg-input-background px-3 py-2 text-sm transition-all outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-muted dark:border-muted cursor-pointer';
    
    const selectedText = document.createElement('span');
    selectedText.className = 'flex items-center gap-2';
    
    const arrow = document.createElement('svg');
    arrow.className = 'w-4 h-4 transition-transform';
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', 'currentColor');
    arrow.setAttribute('viewBox', '0 0 24 24');
    arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';
    
    button.appendChild(selectedText);
    button.appendChild(arrow);
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 hidden dark:bg-card';
    dropdown.style.display = 'none';
    
    // Add options
    Array.from(this.select.options).forEach((option, index) => {
      const item = document.createElement('div');
      item.className = 'px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors';
      item.textContent = option.text;
      item.dataset.value = option.value;
      
      if (option.selected) {
        selectedText.textContent = option.text;
        item.classList.add('bg-accent');
      }
      
      item.addEventListener('click', () => {
        this.select.value = option.value;
        this.select.dispatchEvent(new Event('change'));
        selectedText.textContent = option.text;
        dropdown.style.display = 'none';
        arrow.style.transform = '';
        
        // Update active state
        dropdown.querySelectorAll('div').forEach(d => d.classList.remove('bg-accent'));
        item.classList.add('bg-accent');
      });
      
      dropdown.appendChild(item);
    });
    
    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display !== 'none';
      
      // Close all other custom selects
      document.querySelectorAll('.custom-select-wrapper .absolute').forEach(d => {
        d.style.display = 'none';
      });
      document.querySelectorAll('.custom-select-wrapper svg').forEach(s => {
        s.style.transform = '';
      });
      
      if (!isOpen) {
        dropdown.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
      }
    });
    
    // Close on outside click
    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
      arrow.style.transform = '';
    });
    
    this.wrapper.appendChild(button);
    this.wrapper.appendChild(dropdown);
    this.select.parentNode.insertBefore(this.wrapper, this.select);
  }
}

// Initialize custom selects on page load
window.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for main app.js to load
  setTimeout(() => {
    document.querySelectorAll('#viewMode, #themeSelect, #defaultViewSelect').forEach(select => {
      new CustomSelect(select);
    });
  }, 100);
});
