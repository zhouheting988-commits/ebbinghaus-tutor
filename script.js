(function () {
    // This function runs when the extension is loaded
    function onExtensionLoaded() {
        console.log("Ebbinghaus Tutor Extension Loaded!");

        // Create a simple button to test if our script is working
        const testButton = document.createElement('button');
        testButton.textContent = 'Ebbinghaus Tutor v0.1';
        testButton.classList.add('SillyTavern-Ebbinghaus-button'); // Add a class for styling
        
        // Add a click event for testing
        testButton.addEventListener('click', () => {
            alert('插件已成功加载！我们即将在这里构建功能。');
        });

        // Add the button to the top bar of SillyTavern
        // We look for an existing element to attach our button to.
        // The header is a good place.
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(testButton);
        } else {
            // As a fallback, add it to the body
            document.body.appendChild(testButton);
        }
    }

    // Wait for the main UI to be ready before running our code
    document.addEventListener('DOMContentLoaded', onExtensionLoaded);
})();
