document.addEventListener("DOMContentLoaded", () => {
    
    // === 1. DARK / LIGHT MODE CONTROLLER ===
    const themeToggle = document.getElementById("themeToggle");
    const currentTheme = localStorage.getItem("theme") || "light";

    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.innerHTML = '<i class="fas fa-sun" style="color: #fbbf24;"></i>';
    } else {
        document.documentElement.removeAttribute("data-theme");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeToggle.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        if (theme === "dark") {
            document.documentElement.removeAttribute("data-theme");
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            themeToggle.innerHTML = '<i class="fas fa-sun" style="color: #fbbf24;"></i>';
            localStorage.setItem("theme", "dark");
        }
        calculateLiveProgress(); 
    });


    // === 2. AUTOMATIC 7-DAYS CALENDAR STRIP ===
    const calendarStrip = document.getElementById("calendarStrip");
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for(let i = -2; i <= 4; i++) {
        let targetDate = new Date();
        targetDate.setDate(today.getDate() + i);
        
        let dayCard = document.createElement("div");
        dayCard.className = `calendar-day-card ${i === 0 ? 'active-day' : ''}`;
        dayCard.innerHTML = `
            <span class="day-num" style="color: ${i===0 ? 'white' : 'var(--dark)'}">${targetDate.getDate()}</span>
            <span class="day-name" style="color: ${i===0 ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'}">${daysName[targetDate.getDay()]}</span>
        `;
        
        dayCard.addEventListener("click", () => {
            document.querySelectorAll(".calendar-day-card").forEach(c => c.classList.remove("active-day"));
            document.querySelectorAll(".calendar-day-card .day-num").forEach(n => n.style.color = "var(--dark)");
            document.querySelectorAll(".calendar-day-card .day-name").forEach(m => m.style.color = "var(--text-muted)");
            
            dayCard.classList.add("active-day");
            dayCard.querySelector(".day-num").style.color = "white";
            dayCard.querySelector(".day-name").style.color = "rgba(255,255,255,0.8)";
        });
        calendarStrip.appendChild(dayCard);
    }


    // === 3. DYNAMIC INPUTS MANAGEMENT ===
    const addSubjectBtn = document.getElementById("addSubjectBtn");
    const subjectsContainer = document.getElementById("subjectsContainer");
    const studyForm = document.getElementById("studyForm");
    const emptyState = document.getElementById("emptyState");
    const planResult = document.getElementById("planResult");

    addSubjectBtn.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "subject-row-v2"; 
        row.innerHTML = `
            <div class="input-glow-wrap name-field">
                <i class="fas fa-signature input-icon"></i>
                <input type="text" placeholder="Subject Name" class="sub-name" required>
            </div>
            <div class="input-glow-wrap tag-field">
                <i class="fas fa-tag input-icon"></i>
                <input type="text" placeholder="Tag (eg: Coding)" class="sub-tag">
            </div>
            <div class="select-glow-wrap">
                <select class="sub-diff">
                    <option value="hard">🔥 Hard</option>
                    <option value="medium" selected>⚡ Medium</option>
                    <option value="easy">🌱 Easy</option>
                </select>
            </div>
            <div class="select-glow-wrap">
                <select class="sub-priority">
                    <option value="high">🔺 High</option>
                    <option value="medium" selected>🔸 Medium</option>
                    <option value="low">🔹 Low</option>
                </select>
            </div>
            <button type="button" class="btn delete-btn" style="padding: 12px; color: #ef4444; background: none; border: none; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
        `;
        subjectsContainer.appendChild(row);
        row.querySelector(".delete-btn").addEventListener("click", () => row.remove());
    });


    // === 4. STANDALONE SERVERLESS TIMELINE COMPILER ===
    studyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const totalHours = parseFloat(document.getElementById("studyHours").value);
        const preferredTime = document.querySelector('input[name="timeOfDay"]:checked').value;
        const goal = document.getElementById("studyGoal").value;
        const subjectRows = document.querySelectorAll(".subject-row-v2");
        
        let subjects = [];
        let totalWeight = 0;

        subjectRows.forEach(row => {
            const name = row.querySelector(".sub-name").value;
            const tag = row.querySelector(".sub-tag").value || "General";
            const diff = row.querySelector(".sub-diff").value;
            const priority = row.querySelector(".sub-priority").value;

            let weight = 0;
            if (diff === "hard") weight += 3;
            else if (diff === "medium") weight += 2;
            else weight += 1;

            if (priority === "high") weight += 3;
            else if (priority === "medium") weight += 2;
            else weight += 1;

            totalWeight += weight;
            subjects.push({ name, tag, diff, priority, weight });
        });

        emptyState.classList.add("hidden");
        planResult.classList.remove("hidden");

        const todayBar = document.getElementById("todayBar");
        let activeGraphHeight = Math.min((totalHours / 12) * 100, 100);
        todayBar.style.height = `${activeGraphHeight}%`;
        todayBar.querySelector("span").innerText = `${totalHours}h`;

        let htmlContent = `
            <div class="plan-header">
                <h3>🚀 Your AI Study Plan Generated!</h3>
                <p><strong>Focus:</strong> ${goal} | <strong>Peak Window:</strong> ${preferredTime}</p>
            </div>
            <div class="plan-body">
        `;

        subjects.forEach((sub, index) => {
            let allocatedHours = ((sub.weight / totalWeight) * totalHours).toFixed(1);
            if(allocatedHours < 0.5) allocatedHours = 0.5;

            htmlContent += `
                <div class="plan-subject-item">
                    <div class="task-left">
                        <input type="checkbox" class="task-checkbox">
                        <div>
                            <strong class="task-title">${sub.name}</strong>
                            <span class="custom-pill-tag">#${sub.tag}</span>
                        </div>
                    </div>
                    <div style="font-weight: bold; color: var(--primary);">
                        ${allocatedHours} Hrs
                    </div>
                </div>
            `;

            if(index !== subjects.length - 1) {
                htmlContent += `
                    <div class="plan-subject-item break-item">
                        <div class="task-left">
                            <i class="fas fa-coffee" style="color: var(--secondary);"></i>
                            <div>
                                <strong class="task-title">Brain Refresh Break</strong>
                                <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Relaxation Window</span>
                            </div>
                        </div>
                        <div style="font-weight: bold; color: var(--secondary);">
                            15 Mins
                        </div>
                    </div>
                `;
            }
        });

        htmlContent += `
            <div class="plan-subject-item" style="border-left-color: var(--warning)">
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox">
                    <div>
                        <strong class="task-title">🔄 Active Recall & Revision Loop</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Daily Review</span>
                    </div>
                </div>
                <div style="font-weight: bold; color: var(--warning);">
                    0.5 Hrs
                </div>
            </div>
        </div>`;

        planResult.innerHTML = htmlContent;
        attachCheckboxListeners();
        resetProgressUI();

        document.getElementById("plannerOutput").scrollIntoView({ behavior: 'smooth' });

        // === 🤖 CONNECTING DIRECTLY TO LOCAL NODE.JS BACKEND (FIXED CORS & PROXY) ===
        const subjectNames = subjects.map(s => s.name);
        let aiScheduleText = "";

        try {
            // Hum direct client-side call ki jagah server.js ko request bhej rahe hain
            const response = await fetch("http://localhost:8080/api/save-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    goal: goal,
                    timeShift: preferredTime,
                    hours: totalHours,
                    subjects: subjectNames
                })
            });

            const jsonRes = await response.json();
            if (jsonRes.success) {
                aiScheduleText = jsonRes.schedule;
            } else {
                throw new Error("Server error while generating timeline.");
            }

        } catch (apiError) {
            console.error("Local backend fallback channel initialized:", apiError);
            aiScheduleText = `[Smart Client Schedule compiled]\nFocus Target: ${goal}\nTotal Duration: ${totalHours} Hours\nPeak State: ${preferredTime}\nSubjects Matrix: ${JSON.stringify(subjectNames)}`;
        }

        // === 💾 CLIENT STORAGE REPLICA (LOCAL DATABASE MIGRATION) ===
        const localDBStructure = {
            goal: goal,
            timeShift: preferredTime,
            hours: totalHours,
            subjects: subjectNames,
            ai_schedule: aiScheduleText,
            timestamp: new Date().toISOString()
        };

        let savedPlans = JSON.parse(localStorage.getItem("studyai_plans") || "[]");
        savedPlans.push(localDBStructure);
        localStorage.setItem("studyai_plans", JSON.stringify(savedPlans));

        alert("🎉 Success! AI Study Plan Saved to Database!\n\n🤖 Gemini AI Schedule:\n" + aiScheduleText);
    });


    // === 5. MONITOR WORKFLOW METRICS TRACKER ===
    function attachCheckboxListeners() {
        const checkboxes = document.querySelectorAll(".task-checkbox");
        checkboxes.forEach(box => {
            box.addEventListener("change", (e) => {
                const titleNode = e.target.nextElementSibling.querySelector(".task-title");
                if(e.target.checked) {
                    titleNode.classList.add("checked-text");
                } else {
                    titleNode.classList.remove("checked-text");
                }
                calculateLiveProgress();
            });
        });
    }

    function calculateLiveProgress() {
        const total = document.querySelectorAll(".task-checkbox").length;
        const checked = document.querySelectorAll(".task-checkbox:checked").length;
        const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
        
        document.getElementById("progressPercent").innerText = `${percent}%`;
        
        const currentThemeMode = document.documentElement.getAttribute("data-theme");
        const cardBgColor = currentThemeMode === "dark" ? "#111827" : "#ffffff";
        const itemBgColor = currentThemeMode === "dark" ? "#1f2937" : "#f1f5f9";

        const circularProgress = document.querySelector(".circular-progress");
        if (circularProgress) {
            circularProgress.style.background = `radial-gradient(${cardBgColor} 60%, transparent 61%), conic-gradient(var(--secondary) ${percent}%, ${itemBgColor} ${percent}%)`;
        }
    }

    function resetProgressUI() {
        document.getElementById("progressPercent").innerText = "0%";
        calculateLiveProgress();
    }


    // === 6. POMODORO COUNTER LAB ===
    let timer;
    let timeRemaining = 25 * 60; 
    let isRunning = false;
    let timerMode = "focus"; 

    const timerDisplay = document.getElementById("timerDisplay");
    const startBtn = document.getElementById("startTimer");
    const pauseBtn = document.getElementById("pauseTimer");
    const resetBtn = document.getElementById("resetTimer");
    const alarmSound = document.getElementById("alarmSound");
    const pMode = document.getElementById("pomodoroMode");
    const bMode = document.getElementById("breakMode");

    function updateTimerUI() {
        const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const secs = (timeRemaining % 60).toString().padStart(2, '0');
        timerDisplay.innerText = `${mins}:${secs}`;
    }

    startBtn.addEventListener("click", () => {
        if (isRunning) return;
        isRunning = true;
        timer = setInterval(() => {
            if(timeRemaining > 0) {
                timeRemaining--;
                updateTimerUI();
            } else {
                clearInterval(timer);
                isRunning = false;
                try { alarmSound.play(); } catch(e) {}
                
                if(timerMode === "focus") {
                    timerMode = "break";
                    timeRemaining = 5 * 60; 
                    pMode.classList.remove("active-mode");
                    bMode.classList.add("active-mode");
                    alert("Focus session complete! Time for a short break.");
                } else {
                    timerMode = "focus";
                    timeRemaining = 25 * 60;
                    bMode.classList.remove("active-mode");
                    pMode.classList.add("active-mode");
                    alert("Break is over! Let's focus again.");
                }
                updateTimerUI();
            }
        }, 1000);
    });

    pauseBtn.addEventListener("click", () => {
        clearInterval(timer);
        isRunning = false;
    });

    resetBtn.addEventListener("click", () => {
        clearInterval(timer);
        isRunning = false;
        timerMode = "focus";
        timeRemaining = 25 * 60;
        pMode.classList.add("active-mode");
        bMode.classList.remove("active-mode");
        updateTimerUI();
    });


    // === 7. ULTRA-RELAXING BRAINWAVE ACOUSTIC SYSTEM ===
    let audioContext;
    let activeNodes = {};

    const playButtons = document.querySelectorAll(".sound-play-btn");
    playButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const soundType = btn.getAttribute("data-sound");
            
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (btn.classList.contains("playing")) {
                if (activeNodes[soundType]) {
                    if (soundType === "lofi") {
                        activeNodes["lofi"].oscL.stop();
                        activeNodes["lofi"].oscR.stop();
                    } else {
                        activeNodes[soundType].stop();
                    }
                    delete activeNodes[soundType];
                }
                btn.classList.remove("playing");
                btn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                btn.classList.add("playing");
                btn.innerHTML = '<i class="fas fa-stop"></i>';
                
                if (soundType === "rain") {
                    activeNodes["rain"] = playPremiumTherapeuticRain();
                } else if (soundType === "lofi") {
                    activeNodes["lofi"] = playAlphaBinauralRelaxer();
                }
            }
        });
    });

    function playPremiumTherapeuticRain() {
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 4.5; 
        }

        const rainSource = audioContext.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const lowpass = audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 350; 

        const notch = audioContext.createBiquadFilter();
        notch.type = 'notepad';
        notch.frequency.value = 120;

        rainSource.connect(lowpass);
        lowpass.connect(notch);
        notch.connect(audioContext.destination);
        
        rainSource.start();
        return rainSource;
    }

    function playAlphaBinauralRelaxer() {
        const pannerL = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;
        const pannerR = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;
        
        const oscL = audioContext.createOscillator();
        const oscR = audioContext.createOscillator();
        
        const gainL = audioContext.createGain();
        const gainR = audioContext.createGain();

        oscL.type = 'sine';
        oscL.frequency.value = 200; 
        
        oscR.type = 'sine';
        oscR.frequency.value = 210; 

        gainL.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainR.gain.setValueAtTime(0.08, audioContext.currentTime);

        if (pannerL && pannerR) {
            pannerL.pan.value = -1; 
            pannerR.pan.value = 1;  
            
            oscL.connect(gainL).connect(pannerL).connect(audioContext.destination);
            oscR.connect(gainR).connect(pannerR).connect(audioContext.destination);
        } else {
            oscL.connect(gainL).connect(audioContext.destination);
            oscR.connect(gainR).connect(audioContext.destination);
        }

        oscL.start();
        oscR.start();

        return {
            oscL: oscL,
            oscR: oscR,
            stop: function() {
                this.oscL.stop();
                this.oscR.stop();
            }
        };
    }
});