(function() {
    var threadID = null;
    var backendURL = "https://canacobackend-cognitivedsai.replit.app";
    var typingIndicatorInterval = null;
    var apiKey = "mi_llave_de_protección"; // Añadir la clave API

    // Crear burbuja flotante
    var chatBubble = document.createElement('div');
    chatBubble.className = 'chat-bubble';
    chatBubble.innerHTML = '<img src="static/images/ai-bot-icon.png" alt="Chat">';
    document.body.appendChild(chatBubble);

    // Crear contenedor de chat
    var chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.innerHTML = `
  <div class="chat-content-vertical">
      <div class="chat-header">
          <img src="static/images/logo.png" alt="Yumsy Logo">
          <button class="chat-close" id="chatClose">x</button>
      </div>
      <div class="chat-bot-info">
          <img src="static/images/ai-bot-icon.png" alt="Yumbot" class="chat-bot-icon">
          <span class="chat-bot-title">Canabot  👋</span>
          <span class="chat-bot-subtitle">Asistente de IA de Canaco</span>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input-container">
          <button id="startConversationButton">Iniciar conversación</button>
          <input type="text" id="chatInput" placeholder="Escribe un mensaje..." style="display: none;">
          <button id="sendButton" style="display: none;">Enviar</button>
      </div>
  </div>
`;
    document.body.appendChild(chatContainer);

    var chatMessages = document.getElementById('chatMessages');
    var chatInput = document.getElementById('chatInput');
    var sendButton = document.getElementById('sendButton');
    var startConversationButton = document.getElementById('startConversationButton');
    var chatClose = document.getElementById('chatClose');

    // Mostrar/ocultar chat
    chatBubble.addEventListener('click', function() {
        chatContainer.style.display = 'flex';
        chatBubble.style.display = 'none';
        if (!threadID) {
            showStartConversationButton();
        } else {
            resetChat();
        }
    });

    chatClose.addEventListener('click', function() {
        chatContainer.style.display = 'none';
        chatBubble.style.display = 'flex';
        threadID = null;  // Resetear threadID
        chatMessages.innerHTML = '';  // Limpiar mensajes del chat
        showStartConversationButton();
    });

    startConversationButton.addEventListener('click', startConversation);

    // Enviar mensaje
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    function showStartConversationButton() {
        startConversationButton.style.display = 'block';
        chatInput.style.display = 'none';
        sendButton.style.display = 'none';
    }

    function showChatInput() {
        startConversationButton.style.display = 'none';
        chatInput.style.display = 'block';
        sendButton.style.display = 'block';
    }

    function startConversation() {
        console.log("Iniciando conversación...");
        fetch(`${backendURL}/start?platform=Web`, {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey // Añadir la clave API a los encabezados
            }
        })
            .then(response => {
                console.log("Respuesta de /start:", response);
                if (!response.ok) throw new Error("Error al obtener el thread_id");
                return response.json();
            })
            .then(data => {
                console.log("Datos obtenidos de /start:", data);
                threadID = data.thread_id;
                addMessageToChat('Asistente', '¿En qué te puedo servir? 😊');
                showChatInput();
            })
            .catch(error => {
                console.error('Error al iniciar la conversación:', error);
                addMessageToChat('Error', 'No se pudo iniciar la conversación.');
            });
    }

    function resetChat() {
        // Reiniciar el chat al mensaje predeterminado de bienvenida
        chatMessages.innerHTML = '';
        addMessageToChat('Asistente', '¿En qué te puedo servir? 😊');
    }

    function sendMessage() {
        var message = chatInput.value.trim();
        if (!message || !threadID) return;

        addMessageToChat('Tú', message);

        chatInput.value = '';

        startTypingIndicator();

        console.log("Enviando mensaje al backend:", message);
        fetch(`${backendURL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey // Añadir la clave API a los encabezados
            },
            body: JSON.stringify({
                thread_id: threadID,
                message: message
            })
        })
            .then(response => {
                console.log("Respuesta de /chat:", response);
                if (!response.ok) throw new Error("Error al enviar el mensaje");
                return response.json();
            })
            .then(data => {
                console.log("Datos obtenidos de /chat:", data);
                stopTypingIndicator();
                addMessageToChat('Asistente', data.response);
            })
            .catch(error => {
                console.error('Error al obtener respuesta:', error);
                stopTypingIndicator();
                addMessageToChat('Error', 'No se pudo obtener respuesta.');
            });
    }

    function startTypingIndicator() {
        var typingIndicator = document.createElement('p');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<strong>Asistente:</strong> Escribiendo';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        typingIndicatorInterval = setInterval(() => {
            if (typingIndicator.innerHTML.endsWith('...')) {
                typingIndicator.innerHTML = '<strong>Asistente:</strong> Escribiendo';
            } else {
                typingIndicator.innerHTML += '.';
            }
        }, 500);
    }

    function stopTypingIndicator() {
        clearInterval(typingIndicatorInterval);
        typingIndicatorInterval = null;

        var typingIndicators = chatMessages.querySelectorAll('.typing-indicator');
        typingIndicators.forEach(function(indicator) {
            indicator.remove();
        });
    }

    function addMessageToChat(sender, message) {
        var typingIndicator = chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) typingIndicator.remove();

        var messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${marked.parse(message)}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
})();
