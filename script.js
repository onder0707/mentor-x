const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const aiCore = document.getElementById("aiCore");

// Sekme Değiştirme Mantığı
const navBtns = document.querySelectorAll(".nav-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Kayıtlı Bilgileri Yükle
let apiKey = localStorage.getItem("mentorX_apiKey") || "";
document.getElementById("apiKeyInput").value = apiKey;

let mentorMemory = JSON.parse(localStorage.getItem("mentorX_memory")) || {
  userName: "Önder Kozak",
  details: "Yazılım, oyun geliştirme ve tarih ile ilgileniyor. Eşit Ağırlık öğrencisi."
};

document.getElementById("memName").value = mentorMemory.userName;
document.getElementById("memDetails").value = mentorMemory.details;

// Ayarları Kaydetme
document.getElementById("saveKeyBtn").addEventListener("click", () => {
  apiKey = document.getElementById("apiKeyInput").value.trim();
  localStorage.setItem("mentorX_apiKey", apiKey);
  alert("API Key kaydedildi!");
});

document.getElementById("saveMemoryBtn").addEventListener("click", () => {
  mentorMemory.userName = document.getElementById("memName").value.trim();
  mentorMemory.details = document.getElementById("memDetails").value.trim();
  localStorage.setItem("mentorX_memory", JSON.stringify(mentorMemory));
  alert("Hafıza güncellendi!");
});

// AI Sohbet Mantığı
let chatHistory = [];

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  if (!apiKey) {
    appendMessage("bot", "Lütfen önce Ayarlar sekmesine gidip API Key'inizi kaydedin!");
    return;
  }

  appendMessage("user", text);
  userInput.value = "";
  aiCore.classList.add("thinking");

  const systemInstruction = `Sen MENTOR-X adında karizmatik bir yapay zekasın. Kullanıcı adı: ${mentorMemory.userName}. Bilgiler: ${mentorMemory.details}`;
  chatHistory.push({ role: "user", parts: [{ text }] });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    aiCore.classList.remove("thinking");
  }
}

function appendMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.innerHTML = role === 'bot' 
    ? `<div class="sender">MENTOR-X</div><div class="text">${text}</div>`
    : `<div class="text">${text}</div>`;
  
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
          
