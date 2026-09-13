const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const aiCore = document.getElementById("aiCore");

// API Key doğrudan koda sabitlendi
let apiKey = "AQ.Ab8RN6IaDb11dgqWs0TXdEPB-I-mDxTZraAWhhIk9iFHpKewGw";

// Sekme Değiştirme Mantığı
const navBtns = document.querySelectorAll(".nav-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

if (navBtns.length > 0) {
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });
}

// Kayıtlı Hafıza Bilgileri
let mentorMemory = JSON.parse(localStorage.getItem("mentorX_memory")) || {
  userName: "Önder Kozak",
  details: "Yazılım, oyun geliştirme ve tarih ile ilgileniyor. Eşit Ağırlık öğrencisi."
};

const memNameInput = document.getElementById("memName");
const memDetailsInput = document.getElementById("memDetails");
if (memNameInput) memNameInput.value = mentorMemory.userName;
if (memDetailsInput) memDetailsInput.value = mentorMemory.details;

const saveMemBtn = document.getElementById("saveMemoryBtn");
if (saveMemBtn) {
  saveMemBtn.addEventListener("click", () => {
    mentorMemory.userName = memNameInput.value.trim();
    mentorMemory.details = memDetailsInput.value.trim();
    localStorage.setItem("mentorX_memory", JSON.stringify(mentorMemory));
    alert("Hafıza güncellendi!");
  });
}

// AI Sohbet Mantığı
let chatHistory = [];

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";
  if (aiCore) aiCore.classList.add("thinking");

  const systemInstruction = `Sen MENTOR-X adında karizmatik bir yapay zekasın. Kullanıcı adı: ${mentorMemory.userName}. Bilgiler: ${mentorMemory.details}`;
  
  chatHistory.push({ role: "user", parts: [{ text: text }] });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          ...chatHistory.slice(-10)
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      appendMessage("bot", `API Hatası: ${data.error.message || 'Geçersiz API Key'}`);
    } else if (data.candidates && data.candidates[0].content) {
      const botText = data.candidates[0].content.parts[0].text;
      chatHistory.push({ role: "model", parts: [{ text: botText }] });
      appendMessage("bot", botText);
    } else {
      appendMessage("bot", "Yanıt alınamadı. API Key'inizi aistudio.google.com üzerinden tekrar kontrol edin.");
    }
  } catch (err) {
    appendMessage("bot", "Bağlantı hatası! Sunucuya erişilemedi.");
  } finally {
    if (aiCore) aiCore.classList.remove("thinking");
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

if (sendBtn) sendBtn.addEventListener("click", sendMessage);
if (userInput) userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
