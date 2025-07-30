document.addEventListener('DOMContentLoaded', function() {
    // Get menu buttons
    const singleplayerBtn = document.getElementById('singleplayerBtn');
    const chooseLevelBtn = document.getElementById('chooseLevelBtn');
    const multiplayerBtn = document.getElementById('multiplayerBtn');
    const mapEditorBtn = document.getElementById('mapEditorBtn');

    // Add click event listeners
    singleplayerBtn.addEventListener('click', function() {
        // Navigate to the main game
        window.location.href = 'index.html';
    });

    chooseLevelBtn.addEventListener('click', function() {
        // Navigate to the level selection page
        window.location.href = 'choose-level.html';
    });

    multiplayerBtn.addEventListener('click', function() {
        // For now, show a placeholder message
        // In the future, this could navigate to a multiplayer lobby
        alert('Multiplayer mode is coming soon! This feature will allow you to play with friends online.');
    });

    mapEditorBtn.addEventListener('click', function() {
        // Navigate to the map editor
        window.location.href = 'map-editor.html';
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case '1':
            case 'Digit1':
                singleplayerBtn.click();
                break;
            case '2':
            case 'Digit2':
                chooseLevelBtn.click();
                break;
            case '3':
            case 'Digit3':
                multiplayerBtn.click();
                break;
            case '4':
            case 'Digit4':
                mapEditorBtn.click();
                break;
            case 'Enter':
                // Default to singleplayer when pressing Enter
                singleplayerBtn.click();
                break;
        }
    });

    // Add hover sound effects (optional)
    const buttons = document.querySelectorAll('.menu-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            // Add a subtle visual feedback
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        button.addEventListener('mouseleave', function() {
            // Reset the transform
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add loading animation
    window.addEventListener('load', function() {
        const menuContainer = document.querySelector('.menu-container');
        menuContainer.style.opacity = '0';
        menuContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            menuContainer.style.transition = 'all 0.5s ease';
            menuContainer.style.opacity = '1';
            menuContainer.style.transform = 'translateY(0)';
        }, 100);
    });
}); 