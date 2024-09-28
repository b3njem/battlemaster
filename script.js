document.addEventListener('DOMContentLoaded', () => {
    console.log('BattleMaster Info page loaded.');

    // Data for the units
    const unitData = {
        knight: {
            name: 'Knight',
            image: 'images/knight.jpg',
            attributes: [
                { icon: 'fas fa-sword', label: 'Attack', value: '75' },
                { icon: 'fas fa-heart', label: 'Health', value: '150' },
                { icon: 'fas fa-coins', label: 'Maintenance', value: '20' },
                { icon: 'fas fa-hammer', label: 'Resources', value: 'Iron, Horse' },
            ],
            infoText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent in justo ac leo egestas pharetra.'
        },
        peasant: {
            name: 'Peasant',
            image: 'images/peasant.jpg',
            attributes: [
                { icon: 'fas fa-sword', label: 'Attack', value: '30' },
                { icon: 'fas fa-heart', label: 'Health', value: '50' },
                { icon: 'fas fa-coins', label: 'Maintenance', value: '5' },
                { icon: 'fas fa-hammer', label: 'Resources', value: 'Wood' },
            ],
            infoText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus euismod sapien non dui aliquam, in interdum nisi posuere.'
        },
        placeholder1: {
            name: 'Unit Name',
            image: '',
            attributes: [
                { icon: 'fas fa-sword', label: 'Attack', value: '--' },
                { icon: 'fas fa-heart', label: 'Health', value: '--' },
                { icon: 'fas fa-coins', label: 'Maintenance', value: '--' },
                { icon: 'fas fa-hammer', label: 'Resources', value: '--' },
            ],
            infoText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.'
        },
        placeholder2: {
            name: 'Unit Name',
            image: '',
            attributes: [
                { icon: 'fas fa-sword', label: 'Attack', value: '--' },
                { icon: 'fas fa-heart', label: 'Health', value: '--' },
                { icon: 'fas fa-coins', label: 'Maintenance', value: '--' },
                { icon: 'fas fa-hammer', label: 'Resources', value: '--' },
            ],
            infoText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.'
        },
        // Add more units here if needed
    };

    const moreInfoButtons = document.querySelectorAll('.more-info');
    const modal = document.getElementById('unitModal');
    const closeButton = document.querySelector('.close-button');
    const modalCard = document.querySelector('.modal-card');
    const modalInfo = document.querySelector('.modal-info');

    // Function to open the modal
    moreInfoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const unitKey = button.getAttribute('data-unit');
            const unit = unitData[unitKey];

            if (unit) {
                // Create enlarged card
                modalCard.innerHTML = `
                    <div class="unit-card enlarged">
                        <div class="unit-banner">
                            <h2>${unit.name}</h2>
                        </div>
                        ${unit.image ? `<img src="${unit.image}" alt="${unit.name}" class="unit-image">` : `
                        <div class="unit-image-placeholder">
                            <i class="fas fa-image fa-5x"></i>
                        </div>`}
                        <div class="attributes">
                            ${unit.attributes.map(attr => `
                                <div class="attribute">
                                    <i class="${attr.icon}"></i>
                                    <span>${attr.label}: ${attr.value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Insert info text
                modalInfo.innerHTML = `<p>${unit.infoText}</p>`;

                // Show modal
                modal.style.display = 'block';
            }
        });
    });

    // Function to close the modal
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close the modal when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});

