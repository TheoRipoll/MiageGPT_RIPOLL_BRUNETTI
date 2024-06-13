const endpointURL = 'http://localhost:3001/chat';
import { getImageFromDallE } from './dallE.js';

let outputElement, submitButton, inputElement, convElement, historyElement, newChatButton, currentConversationId, speechMode;

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    convElement = document.querySelector('.conv');
    newChatButton = document.querySelector('button');

    newChatButton.onclick = newConversation;

    speechMode = false;

    loadHistory();
}

function newConversation() {
    currentConversationId = 'conv' + Date.now(); 
    convElement.innerHTML = ''; 
    localStorage.setItem('currentConversationId', currentConversationId);
    addConversationToHistory(currentConversationId);
}

function saveToHistory(message, isUser) {
    let history = JSON.parse(localStorage.getItem(currentConversationId)) || [];
    history.push({ text: message, user: isUser });
    localStorage.setItem(currentConversationId, JSON.stringify(history));
}

function addConversationToHistory(convId) {
    const pElement = document.createElement('p');
    pElement.textContent = `Conversation ${convId}`;
    pElement.onclick = () => loadConversation(convId);
    historyElement.appendChild(pElement);
}

function loadConversation(convId) {
    currentConversationId = convId;
    const history = JSON.parse(localStorage.getItem(convId)) || [];
    convElement.innerHTML = '';
    history.forEach(item => {
        addMessageToHistory(item.text, item.user);
    });
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
    pElement.classList.add('message', isUser ? 'user-message' : 'server-message');
    convElement.appendChild(pElement);
    convElement.scrollTop = convElement.scrollHeight;
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

    inputElement.value = '';
    saveToHistory(prompt, true);
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
