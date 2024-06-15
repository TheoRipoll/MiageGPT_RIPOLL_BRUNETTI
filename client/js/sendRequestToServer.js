const endpointURL = 'http://localhost:3001/chat';
import { getImageFromDallE } from './dallE.js';

let outputElement, submitButton, inputElement, convElement, historyElement, butonElement, speechMode;

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;
    // Si on appuie sur entrée, on envoie le message
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            getMessage();
        }
    });

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    convElement = document.querySelector('.conv');
    butonElement = document.querySelector('button');
    //butonElement.onclick = clearInput;

    speechMode = false;

    loadHistory(); // Charger l'historique au démarrage de l'application
}

function saveToHistory(message, isUser) {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.push({ text: message, user: isUser });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.forEach(item => {
        addMessageToHistory(item.text, item.user);
    });
}

function addMessageToHistory(message, isUser) {
    const pElement = document.createElement('p');
    pElement.textContent = message;
    // Appliquer des classes CSS pour aligner les messages à gauche ou à droite
    pElement.classList.add('message', isUser ? 'user-message' : 'server-message');

    // Ajouter le nouvel élément à la fin de l'historique pour suivre l'ordre de la conversation
    convElement.appendChild(pElement);
    convElement.scrollTop = convElement.scrollHeight; // Faire défiler vers le bas à chaque nouveau message
}

async function getMessage() {
    let prompt = inputElement.value;
    prompt = prompt.toLowerCase();

    if (!prompt.startsWith('/')) {
        getResponseFromServer(prompt);
    }
    else if (prompt.startsWith('/image')) {
        //const imagePrompt = prompt.replace('/image', '').trim();
        //getImageFromDallE(imagePrompt);
        document.getElementById('sidebar').style.display = 'block';
    } 
    else if(prompt.startsWith('/clear')) {
        localStorage.removeItem('chatHistory');
        convElement.innerHTML = '';
        const imageElements = document.querySelectorAll('#output img, .dalle-image');
        imageElements.forEach(el => el.remove());
    } 
    else if(prompt.startsWith('/speech')) {
        const speechPrompt = prompt.replace('/speech', '').trim();
        speechMode = true;
        getResponseFromServer(speechPrompt);
    }

    //addMessageToHistory(prompt, true); // Ajouter le message de l'utilisateur à l'historique
    inputElement.value = '';
}

function speakText(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

async function getResponseFromServer(prompt) {
    try {
        const promptData = new FormData();
        promptData.append('prompt', prompt);

        const response = await fetch(endpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();

        if (speechMode) {
            speakText(data.choices[0].message.content); // Utiliser la synthèse vocale pour la réponse
            speechMode = false;
        }
        const chatGptResponseTxt = data.choices[0].message.content;
        
        // Ajouter le message de l'utilisateur à l'historique
        addMessageToHistory(prompt, true);
        // Ajouter la réponse du serveur à l'historique
        addMessageToHistory(chatGptResponseTxt, false);

    } catch (error) {
        console.error('Failed to fetch response: ', error);
    }
}

function createDalleImage() {
    const formData = new FormData(document.getElementById('imageForm'));
    const data = {
      subject: formData.get('subject'),
      artStyle: formData.get('artStyle'),
      format: formData.get('format'),
      theme: formData.get('theme'),
      imageStyle: formData.get('imageStyle')
    };
  
    const dallePrompt = `Create a ${data.format} image in ${data.artStyle} style, ${data.theme} theme, depicting ${data.subject} in a ${data.imageStyle} manner.`;
  
    console.log('Sending dalle prompt:', dallePrompt);
    getImageFromDallE(dallePrompt);
}
window.createDalleImage = createDalleImage;

  
function updateOutput(message) {
    outputElement.textContent = message;  // Mettre à jour le texte de l'élément de sortie
}