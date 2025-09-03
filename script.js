document.addEventListener('DOMContentLoaded', function() {
    const gddContainer = document.getElementById('gdd-container');
    const documentListElement = document.getElementById('document-list');
    let allDocuments = [];

    function renderDocument(doc) {
        gddContainer.innerHTML = ''; // Clear previous content

        const title = document.createElement('h1');
        title.textContent = doc.title;
        gddContainer.appendChild(title);

        doc.content.forEach(block => {
            let element;
            switch (block.type) {
                case 'heading':
                    element = document.createElement(`h${block.level}`);
                    element.textContent = block.text;
                    break;
                case 'paragraph':
                    element = document.createElement('p');
                    element.textContent = block.text;
                    break;
                case 'list':
                    element = document.createElement(block.style === 'ordered' ? 'ol' : 'ul');
                    block.items.forEach(itemText => {
                        const li = document.createElement('li');
                        li.textContent = itemText;
                        element.appendChild(li);
                    });
                    break;
                case 'image':
                    element = document.createElement('img');
                    element.src = block.src;
                    element.alt = block.caption;
                    const caption = document.createElement('p');
                    caption.textContent = block.caption;
                    gddContainer.appendChild(element);
                    gddContainer.appendChild(caption);
                    return; // Image and caption handled together
                default:
                    return; // Skip unknown block types
            }
            gddContainer.appendChild(element);
        });
    }

    function populateDocumentList(documents) {
        documentListElement.innerHTML = ''; // Clear previous list
        documents.forEach(doc => {
            const listItem = document.createElement('li');
            listItem.textContent = doc.title;
            listItem.dataset.docId = doc.id; // Store doc ID
            listItem.addEventListener('click', () => {
                // Remove active class from previous item
                const currentActive = documentListElement.querySelector('.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                // Add active class to clicked item
                listItem.classList.add('active');
                const selectedDoc = allDocuments.find(d => d.id === doc.id);
                if (selectedDoc) {
                    renderDocument(selectedDoc);
                }
            });
            documentListElement.appendChild(listItem);
        });

        // Select and render the first document by default
        if (documents.length > 0) {
            documentListElement.querySelector('li').classList.add('active');
            renderDocument(documents[0]);
        }
    }

    // Fetch GDD data
    fetch('gdd_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            allDocuments = data; // Store all documents globally
            populateDocumentList(allDocuments);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            gddContainer.innerHTML = '<h1>Erro ao carregar o GDD. Verifique o console para mais detalhes.</h1>';
        });
});
