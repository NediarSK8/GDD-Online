document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('gdd-container');

    // Faz a requisição para carregar o arquivo JSON
    fetch('gdd.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede: ' + response.statusText);
            }
            return response.json();
        })
        .then(gdd => {
            // Limpa o container do "Carregando..."
            container.innerHTML = '';

            // Cria e adiciona o título do jogo
            const title = document.createElement('h1');
            title.textContent = gdd.gameTitle;
            container.appendChild(title);

            // Adiciona a logline
            const logline = document.createElement('p');
            logline.innerHTML = `<strong>Logline:</strong> ${gdd.logline}`;
            container.appendChild(logline);

            // Adiciona as mecânicas principais
            const mechanicsTitle = document.createElement('h2');
            mechanicsTitle.textContent = 'Mecânicas Principais';
            container.appendChild(mechanicsTitle);

            gdd.coreMechanics.forEach(mechanic => {
                const mechanicName = document.createElement('h3');
                mechanicName.textContent = mechanic.name;
                container.appendChild(mechanicName);

                const mechanicDesc = document.createElement('p');
                mechanicDesc.textContent = mechanic.description;
                container.appendChild(mechanicDesc);
            });
            
            // Adiciona o público-alvo
            const audienceTitle = document.createElement('h2');
            audienceTitle.textContent = 'Público-Alvo';
            container.appendChild(audienceTitle);

            const audience = document.createElement('p');
            audience.textContent = gdd.targetAudience;
            container.appendChild(audience);

            // Se você quiser apenas mostrar o JSON bruto formatado:
            // const rawJson = document.createElement('pre');
            // rawJson.textContent = JSON.stringify(gdd, null, 2); // O 2 é para identação
            // container.appendChild(rawJson);
        })
        .catch(error => {
            console.error('Falha ao carregar o GDD:', error);
            container.innerHTML = '<h1>Erro ao carregar o GDD. Verifique o console para mais detalhes.</h1>';
        });
});