document.addEventListener("DOMContentLoaded", () => {
    // === 1. DARK / LIGHT MODE ENGINE ===
    const themeToggle = document.getElementById("themeToggle");
    const currentTheme = localStorage.getItem("theme");

    // Default theme dark set karne ke liye check
    if (currentTheme === "light") {
        document.documentElement.removeAttribute("data-theme");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.innerHTML = '<i class="fas fa-sun" style="color: #fbbf24;"></i>';
    }

    // Toggle button click logic
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
    });


    // === 2. DYNAMIC INPUTS ENGINE (ADD/DELETE SUBJECTS) ===
    const addSubjectBtn = document.getElementById("addSubjectBtn");
    const subjectsContainer = document.getElementById("subjectsContainer");
    const studyForm = document.getElementById("studyForm");
    const emptyState = document.getElementById("emptyState");
    const planResult = document.getElementById("planResult");

    addSubjectBtn.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "subject-row";
        row.innerHTML = `
            <input type="text" placeholder="Subject Name" class="sub-name" required>
            <select class="sub-diff">
                <option value="hard">Hard</option>
                <option value="medium" selected>Medium</option>
                <option value="easy">Easy</option>
            </select>
            <select class="sub-priority">
                <option value="high">High</option>
                <option value="medium" selected>Medium</option>
                <option value="low">Low</option>
            </select>
            <button type="button" class="btn btn-secondary delete-btn" style="padding: 10px; color: #ef4444; border-color: rgba(239,68,68,0.2);"><i class="fas fa-trash"></i></button>
        `;
        subjectsContainer.appendChild(row);

        // Delete row implementation
        row.querySelector(".delete-btn").addEventListener("click", () => {
            row.remove();
        });
    });


    // === 3. SMART AI CALCULATION ENGINE ===
    studyForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const totalHours = parseFloat(document.getElementById("studyHours").value);
        const preferredTime = document.querySelector('input[name="timeOfDay"]:checked').value;
        const goal = document.getElementById("studyGoal").value;
        const subjectRows = document.querySelectorAll(".subject-row");
        
        let subjects = [];
        let totalWeight = 0;

        // Har subject ke diff aur priority ke mutabik weight calculate karna
        subjectRows.forEach(row => {
            const name = row.querySelector(".sub-name").value;
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
            subjects.push({ name, diff, priority, weight });
        });

        // UI rendering updates
        emptyState.classList.add("hidden");
        planResult.classList.remove("hidden");

        let htmlContent = `
            <div class="plan-header">
                <h3 style="color: var(--primary);">🚀 Your AI Study Plan Generated!</h3>
                <p style="margin-top:5px;"><strong>Focus:</strong> ${goal} | <strong>Shift:</strong> ${preferredTime}</p>
            </div>
            <div class="plan-body">
                <p style="margin-bottom: 15px; color: var(--text-muted); font-size:0.9rem;">Customized daily study split based on weightage metrics:</p>
        `;

        subjects.forEach(sub => {
            // Proportional distribution pattern
            let allocatedHours = ((sub.weight / totalWeight) * totalHours).toFixed(1);
            
            htmlContent += `
                <div class="plan-subject-item">
                    <div>
                        <strong>${sub.name}</strong> 
                        <span style="font-size: 0.8rem; color: var(--text-muted); margin-left:10px;">
                            (${sub.diff} | ${sub.priority})
                        </span>
                    </div>
                    <div style="font-weight: bold; color: var(--primary);">
                        ${allocatedHours} Hrs/day
                    </div>
                </div>
            `;
        });

        // Extra dynamic layout recommendations
        htmlContent += `
            <div style="margin-top: 25px; padding: 15px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px;">
                <h4 style="color: var(--primary); margin-bottom:5px;"><i class="fas fa-lightbulb" style="color: #fbbf24;"></i> AI Recommendations:</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height:1.4;">
                    • Start with tough subjects during your peak <strong>${preferredTime}</strong> hours.<br>
                    • Maintain a 45 min focus + 15 min rest sequence for optimizing this schedule.
                </p>
            </div>
        </div>`;

        planResult.innerHTML = htmlContent;

        // Smooth viewport adjustment scrolling
        document.getElementById("plannerOutput").scrollIntoView({ behavior: 'smooth' });
    });
});