const endpointURL = 'http://localhost:3001/image';

export async function getImageFromDallE(prompt) {
    // On envoie le contenu du prompt dans un FormData (eq. formulaires multipart)
    const promptData = new FormData();
    promptData.append('prompt', prompt);

    // Envoi de la requête POST par fetch, avec le FormData dans la propriété body
    // côté serveur on récupèrera dans req.body.prompt la valeur du prompt,
    // avec nodeJS on utilisera le module multer pour récupérer les donénes 
    // multer gère les données multipart/form-data
    try {
        const response = await fetch(endpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();
        
        console.log('DALL-E Response:', data);

        if (data.data && data.data.length > 0) {
            const imageUrl = data.data[0].url;
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = prompt;
            document.querySelector('#output').append(imgElement);
        } else {
            console.log('No image URL found in the response');
        }
        
    } catch (error) {
        console.log('Error fetching image from DALL-E:', error);
    }
}