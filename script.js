const GEMINI_API_KEY = "API_KEYINI_BURAYA_YAZ"; // AI Studio'dan alacağın key

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const aiCore = document.getElementById("aiCore");

// Kalıcı Profil Hafızası
let mentorMemory = JSON.parse(localStorage.getItem("mentorX_memory")) || {
  userName: "Önder Kozak",
  details: "Yazılım, oyun geliştirme ve tarih ile ilgileniyor. Eşit Ağırlık öğrencisi."
};

let chatHistory = [];

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Kullanıcı mesajını ekrana yazdır
  appendMessage("user", text);
  userInput.value = "";

  // Animasyonu başlat (Düşünme Modu)
  aiCore.classList.add("thinking");

  const systemInstruction = `Sen MENTOR-X adında karizmatik ve akıllı bir yapay zekasın. Kullanıcı adı: ${mentorMemory.userName}. Bilgiler: ${mentorMemory.details}`;
  chatHistory.push({ role: "user", parts: [{ text }] });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: chatHistory.slice(-10)
      })
    });

    const data = await response.json();
    const botText = data.candidates[0].content.parts[0].text;

    chatHistory.push({ role: "model", parts: [{ text: botText }] });
    appendMessage("bot", botText);
  } catch (err) {
    appendMessage("bot", "Bağlantı hatası! Lütfen API anahtarını kontrol et.");
  } finally {
    // Animasyonu bitir
    aiCore.classList.remove("thinking");
  }
}

function appendMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  if(role === 'bot') {
    msgDiv.innerHTML = `<div class="sender">MENTOR-X</div><div class="text">${text}</div>`;
  } else {
    msgDiv.innerHTML = `<div class="text">${text}</div>`;
  }
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
  
