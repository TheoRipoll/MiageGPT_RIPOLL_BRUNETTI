const endpointURL = 'http://localhost:3001/image';

export async function getImageFromDallE(prompt) {
    const promptData = new FormData();
    promptData.append('prompt', prompt);

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
            
            const convElement = document.querySelector('.conv');
            convElement.appendChild(imgElement);
        } else {
            console.log('No image URL found in the response');
        }
        
    } catch (error) {
        console.log('Error fetching image from DALL-E:', error);
    }
}