const endpointURL = 'http://localhost:3001/chat';
import { getImageFromDallE } from './dallE.js';

let outputElement, submitButton, inputElement, convElement, historyElement, butonElement, speechMode;

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    convElement = document.querySelector('.conv');
    butonElement = document.querySelector('button');
    butonElement.onclick = clearInput;

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

    if (prompt.startsWith('/image')) {
        const imagePrompt = prompt.replace('/image', '').trim();
        getImageFromDallE(imagePrompt);
    } if(prompt.startsWith('/clear')) {
        localStorage.removeItem('chatHistory');
        convElement.innerHTML = '';
    } if(prompt.startsWith('/speech')) {
        const speechPrompt = prompt.replace('/speech', '').trim();
        speechMode = true;
        getResponseFromServer(speechPrompt);
    }
     else {
        getResponseFromServer(prompt);
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


function updateOutput(message) {
    outputElement.textContent = message;  // Mettre à jour le texte de l'élément de sortie
}