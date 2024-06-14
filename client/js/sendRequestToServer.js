const endpointURL = 'http://localhost:3001/chat';
import { getImageFromDallE } from './dallE.js';

let outputElement, submitButton, inputElement, convElement, historyElement, newChatButton, speechMode;

let conversations = JSON.parse(localStorage.getItem('conversations')) || {};
let currentConversationId = localStorage.getItem('currentConversationId') || null;

export function getCurrentConversation() {
    return currentConversationId;
}

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

    conversations = JSON.parse(localStorage.getItem('conversations')) || {};
    currentConversationId = localStorage.getItem('currentConversationId');

    loadConversation(currentConversationId);
    loadHistory();
}
function newConversation() {
    const convId = 'conv' + Date.now();
    conversations[convId] = [];
    currentConversationId = convId;
    localStorage.setItem('currentConversationId', currentConversationId);
    localStorage.setItem('conversations', JSON.stringify(conversations));
    addConversationToHistory(convId);
    displayConversation(convId);
    loadHistory();
}
function saveToHistory(message, isUser) {
    let history = conversations[currentConversationId] || [];
    history.push({ text: message, user: isUser });
    conversations[currentConversationId] = history;
    localStorage.setItem('conversations', JSON.stringify(conversations));
    addMessageToDisplay(message, isUser);
}
function addConversationToHistory(convId) {
    const pElement = document.createElement('p');
    pElement.textContent = `Conversation ${convId}`;
    pElement.onclick = () => {
        currentConversationId = convId;
        localStorage.setItem('currentConversationId', convId);
        displayConversation(convId);
    };
    historyElement.appendChild(pElement);
}
function deleteConversation(convId) {
    delete conversations[convId];
    localStorage.setItem('conversations', JSON.stringify(conversations));
    historyElement.innerHTML = '';
    loadHistory();
}
function clearHistory(convId) {
    conversations[convId] = [];
    localStorage.setItem('conversations', JSON.stringify(conversations));
    displayConversation(convId);
}
function displayConversation(convId) {
    const history = conversations[convId] || [];
    convElement.innerHTML = ''; 
    history.forEach(item => {
        addMessageToDisplay(item.text, item.user);
    });
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
    Object.keys(conversations).forEach(convId => {
        addConversationToHistory(convId);
    });
    if (currentConversationId) {
        displayConversation(currentConversationId);
    }
}

function addMessageToHistory(message, isUser) {
    const pElement = document.createElement('p');
    pElement.textContent = message;
    pElement.classList.add('message', isUser ? 'user-message' : 'server-message');
    convElement.appendChild(pElement);
    convElement.scrollTop = convElement.scrollHeight;
}

function addMessageToDisplay(message, isUser) {
    const pElement = document.createElement('p');
    pElement.textContent = message;
    pElement.classList.add('message', isUser ? 'user-message' : 'server-message');
    convElement.appendChild(pElement);
    convElement.scrollTop = convElement.scrollHeight; // Auto-scroll to bottom
}

async function getMessage() {
    let prompt = inputElement.value;
    prompt = prompt.toLowerCase();

    if (prompt.startsWith('/image')) {
        const imagePrompt = prompt.replace('/image', '').trim();
        getImageFromDallE(imagePrompt);
    } if(prompt.startsWith('/clear')) {
        clearHistory(currentConversationId);
        return;
    } if(prompt.startsWith('/delete')) {
        deleteConversation(currentConversationId);
        return;
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
            speakText(data.choices[0].message.content);
        }
        const chatGptResponseTxt = data.choices[0].message.content;

        saveToHistory(chatGptResponseTxt, false);

    } catch (error) {
        console.error('Failed to fetch response: ', error);
    }
}
