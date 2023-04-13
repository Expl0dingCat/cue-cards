document.addEventListener('DOMContentLoaded', function () {
    let cueCards = [];
    const modal = document.getElementById('popup-modal');
    const instance = M.Modal.init(modal);

    // Import button click event
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    // Import file change event
    document.getElementById('import-file').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await readJsonFile(file);
                console.log('Imported data:', data); // Log the imported data
                if (data && data.cueCards) {
                    const newCueCards = data.cueCards;
                    cueCards = cueCards.concat(newCueCards);
                    displaycueCards(cueCards);
                } else {
                    throw new Error('Invalid JSON format'); // Throw an error if the JSON format is incorrect
                }
            } catch (error) {
                console.error('Error:', error); // Log the error message
                M.toast({ html: 'Error: Unable to import cue cards.' });
            }
        }
    });

    // Export button click event
    document.getElementById('export-btn').addEventListener('click', () => {
        const data = {
            cueCards: cueCards
        };
        const json = JSON.stringify(data);
        downloadJsonFile(json, 'cue_cards.json');
    });

    // Open modal button click event
    document.getElementById('modal-btn').addEventListener('click', () => {
        instance.open();
    });

    // Send button click event
    document.getElementById('send-btn').addEventListener('click', async () => {
        const message = document.getElementById('message-input').value;
        const model = document.querySelector('input[name="model"]:checked').value;
        M.toast({ html: `Sending request to ${model}.`, });
        const response = await fetch('/generate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: message, model: model }),
        });
        const data = await response.json();
        if (data && data.generated_text) {
            try {
                console.log('Generated data:', data.generated_text); // Log the generated data (JSON format
                const cueCardData = JSON.parse(data.generated_text);
                const newCueCards = cueCardData.cueCards || [];
                cueCards = cueCards.concat(newCueCards);
                displaycueCards(cueCards);
            } catch (error) {
                console.error('Error:', error); // Log the error message
                M.toast({ html: 'Error: Unable to parse cue cards.' });
            }
        } else {
            M.toast({ html: 'Error: Unable to generate cue cards.' });
        }
        document.getElementById('message-input').value = '';
    });

    function readJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(reader.error);
            };
            reader.readAsText(file);
        });
    }

    function displaycueCards(cards) {
        const container = document.getElementById('cue-card-container');
        container.innerHTML = '';

        cards.forEach((card, index) => {
            const cardElement = createcueCardElement(card, index);
            container.appendChild(cardElement);
        });
    }

    function createcueCardElement(card, index) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('col', 's12', 'm6', 'l4', 'cue-card');
        cardElement.innerHTML = `
            <div class="card">
                <div class="card-content">
                    <span class="card-title">${card.name}</span>
                    <p>${card.description}</p>
                </div>
            </div>
        `;
        cardElement.addEventListener('click', () => {
            const content = cardElement.querySelector('.card-content');
            const title = content.querySelector('.card-title');
            const text = content.querySelector('p');
            
            if (title.textContent === card.name) {
                title.textContent = 'Answer';
                text.textContent = card.answer;
            } else {
                title.textContent = card.name;
                text.textContent = card.description;
            }
        });
        return cardElement;
    }

    function downloadJsonFile(json, filename) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
});