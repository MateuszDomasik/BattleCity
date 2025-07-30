// Victory popup function
export function showVictoryPopup() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: linear-gradient(135deg, #FFD700, #FFA500);
    border: 4px solid #FF8C00;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    color: white;
    max-width: 500px;
    animation: victoryPulse 2s ease-in-out infinite;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes victoryPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
  
  // Create title with emoji
  const title = document.createElement('h1');
  title.innerHTML = '🎉 VICTORY! 🎉';
  title.style.cssText = `
    font-size: 3rem;
    margin-bottom: 20px;
    color: #8B0000;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    animation: bounce 1s ease-in-out infinite;
    font-weight: bold;
  `;
  
  // Add bounce animation
  const bounceStyle = document.createElement('style');
  bounceStyle.textContent = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(bounceStyle);
  
  // Create victory message
  const message = document.createElement('p');
  message.innerHTML = '🏰 You have successfully destroyed the castle!<br>🌟 Mission accomplished!';
  message.style.cssText = `
    font-size: 1.5rem;
    margin-bottom: 30px;
    color: #2F4F2F;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
    font-weight: bold;
  `;
  
  // Create continue button
  const continueButton = document.createElement('button');
  continueButton.textContent = 'Continue';
  continueButton.style.cssText = `
    background: #4CAF50;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 10px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  `;
  
  continueButton.onmouseenter = () => {
    continueButton.style.backgroundColor = '#45a049';
  };
  
  continueButton.onmouseleave = () => {
    continueButton.style.backgroundColor = '#4CAF50';
  };
  
  continueButton.onclick = () => {
    document.body.removeChild(modal);
    // Optionally redirect to menu or restart level
    setTimeout(() => {
      window.location.href = 'menu.html';
    }, 500);
  };
  
  modalContent.appendChild(title);
  modalContent.appendChild(message);
  modalContent.appendChild(continueButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
} 