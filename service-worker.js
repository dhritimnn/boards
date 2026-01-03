        // Global variables and app state
        const AppState = {
            quotes: [
                "Success is the sum of small efforts repeated day in and day out.",
                "The expert in anything was once a beginner.",
                "Study while others are sleeping; work while others are loafing.",
                "Education is the passport to the future.",
                "The beautiful thing about learning is that no one can take it away from you.",
                "Don't watch the clock; do what it does. Keep going."
            ],
            tdata: {},
            mdata: []
        };

        // Initialize app
        function initApp() {
            loadData();
            updateUI();
            loadPreviousDays();
            attachEventListeners();
        }

        // Attach all event listeners
        function attachEventListeners() {
            document.getElementById('subjectHeader').addEventListener('click', toggleSubjectSection);
            document.getElementById('completeSelectionBtn').addEventListener('click', completeSelection);
            document.getElementById('endDayBtn').addEventListener('click', showEndDayPopup);
            document.getElementById('previousDaysHeader').addEventListener('click', togglePreviousDays);
            document.getElementById('closePopupBtn').addEventListener('click', closeEndDayPopup);
            document.getElementById('submitEndDayBtn').addEventListener('click', submitEndDay);
        }

        function loadData() {
            const today = new Date().toDateString();
            AppState.tdata = JSON.parse(localStorage.getItem('tdata') || '{}');
            AppState.mdata = JSON.parse(localStorage.getItem('mdata') || '[]');

            if (AppState.tdata.date !== today) {
                const newDay = Math.min((AppState.tdata.day || 0) + 1, 20);
                AppState.tdata = {
                    date: today,
                    day: newDay,
                    subjects: AppState.tdata.subjects || [],
                    tasks: []
                };
                saveTData();
            }
        }

        function saveTData() {
            localStorage.setItem('tdata', JSON.stringify(AppState.tdata));
        }

        function updateUI() {
            document.getElementById('currentDay').textContent = AppState.tdata.day || 1;
            const progress = ((AppState.tdata.day || 1) / 20) * 100;
            document.getElementById('dayProgress').style.width = progress + '%';

            const checkboxes = document.querySelectorAll('#subjectSection input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = AppState.tdata.subjects.includes(cb.value);
            });

            renderTasks();
            updateTaskProgress();
        }

        function toggleSubjectSection() {
            const section = document.getElementById('subjectSection');
            section.classList.toggle('hidden');
        }

        function completeSelection() {
            const checkboxes = document.querySelectorAll('#subjectSection input[type="checkbox"]:checked');
            AppState.tdata.subjects = Array.from(checkboxes).map(cb => cb.value);
            
            AppState.tdata.tasks = AppState.tdata.subjects.map(subject => ({
                id: Date.now() + Math.random(),
                subject: subject,
                completed: false,
                subtasks: []
            }));

            saveTData();
            toggleSubjectSection();
            renderTasks();
            updateTaskProgress();
        }

        function renderTasks() {
            const taskList = document.getElementById('taskList');
            
            if (!AppState.tdata.tasks || AppState.tdata.tasks.length === 0) {
                taskList.innerHTML = '<p class="text-gray-500 text-center py-4">Please select subjects first</p>';
                return;
            }

            taskList.innerHTML = AppState.tdata.tasks.map(task => `
                <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                    <div class="flex items-start gap-3">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               data-task-id="${task.id}"
                               class="custom-checkbox task-checkbox mt-1">
                        <div class="flex-1">
                            <label class="text-lg font-semibold text-gray-800 cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}">${task.subject}</label>
                            <div class="mt-3 space-y-2" id="subtasks-${task.id}">
                                ${task.subtasks.map(st => `
                                    <div class="flex items-center gap-3 ml-4 p-2 rounded hover:bg-gray-50 transition">
                                        <input type="checkbox" ${st.completed ? 'checked' : ''} 
                                               data-task-id="${task.id}"
                                               data-subtask-id="${st.id}"
                                               class="custom-checkbox-sm subtask-checkbox">
                                        <span class="text-gray-700 flex-1 ${st.completed ? 'line-through text-gray-500' : ''}">${st.name}</span>
                                        <button data-task-id="${task.id}" data-subtask-id="${st.id}" class="delete-subtask-btn text-red-500 hover:text-red-700 p-1">
                                            <i class="bi bi-trash text-sm"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            <button data-task-id="${task.id}" class="add-subtask-btn mt-3 ml-4 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium">
                                <i class="bi bi-plus-circle"></i> Add Subtask
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Attach task-specific event listeners
            attachTaskEventListeners();
        }

        function attachTaskEventListeners() {
            // Task checkboxes
            document.querySelectorAll('.task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    toggleTask(parseFloat(this.dataset.taskId));
                });
            });

            // Subtask checkboxes
            document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    toggleSubtask(parseFloat(this.dataset.taskId), parseFloat(this.dataset.subtaskId));
                });
            });

            // Add subtask buttons
            document.querySelectorAll('.add-subtask-btn').forEach(button => {
                button.addEventListener('click', function() {
                    addSubtask(parseFloat(this.dataset.taskId));
                });
            });

            // Delete subtask buttons
            document.querySelectorAll('.delete-subtask-btn').forEach(button => {
                button.addEventListener('click', function() {
                    deleteSubtask(parseFloat(this.dataset.taskId), parseFloat(this.dataset.subtaskId));
                });
            });
        }

        function toggleTask(taskId) {
            const task = AppState.tdata.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                
                if (task.completed) {
                    task.subtasks.forEach(st => st.completed = true);
                }
                
                saveTData();
                renderTasks();
                updateTaskProgress();
            }
        }

        function addSubtask(taskId) {
            const name = prompt('Enter subtask name:');
            if (name && name.trim()) {
                const task = AppState.tdata.tasks.find(t => t.id === taskId);
                if (task) {
                    task.subtasks.push({
                        id: Date.now() + Math.random(),
                        name: name.trim(),
                        completed: false
                    });
                    saveTData();
                    renderTasks();
                    updateTaskProgress();
                }
            }
        }

        function toggleSubtask(taskId, subtaskId) {
            const task = AppState.tdata.tasks.find(t => t.id === taskId);
            if (task) {
                const subtask = task.subtasks.find(st => st.id === subtaskId);
                if (subtask) {
                    subtask.completed = !subtask.completed;
                    
                    const allSubtasksCompleted = task.subtasks.every(st => st.completed);
                    
                    if (allSubtasksCompleted && task.subtasks.length > 0) {
                        task.completed = true;
                    }
                    
                    if (!subtask.completed) {
                        task.completed = false;
                    }
                    
                    saveTData();
                    renderTasks();
                    updateTaskProgress();
                }
            }
        }

        function deleteSubtask(taskId, subtaskId) {
            const task = AppState.tdata.tasks.find(t => t.id === taskId);
            if (task) {
                task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
                saveTData();
                renderTasks();
                updateTaskProgress();
            }
        }

        function updateTaskProgress() {
            if (!AppState.tdata.tasks || AppState.tdata.tasks.length === 0) {
                document.getElementById('taskProgress').style.width = '0%';
                document.getElementById('progressText').textContent = '0%';
                return;
            }

            const totalSubjects = AppState.tdata.tasks.length;
            const percentPerSubject = 100 / totalSubjects;
            let totalProgress = 0;

            AppState.tdata.tasks.forEach(task => {
                if (task.subtasks.length === 0) {
                    if (task.completed) {
                        totalProgress += percentPerSubject;
                    }
                } else {
                    const percentPerSubtask = percentPerSubject / task.subtasks.length;
                    task.subtasks.forEach(st => {
                        if (st.completed) {
                            totalProgress += percentPerSubtask;
                        }
                    });
                }
            });

            const finalProgress = Math.round(totalProgress);
            document.getElementById('taskProgress').style.width = finalProgress + '%';
            document.getElementById('progressText').textContent = finalProgress + '%';
        }

        function showEndDayPopup() {
            document.getElementById('endDayPopup').classList.remove('hidden');
            const randomQuote = AppState.quotes[Math.floor(Math.random() * AppState.quotes.length)];
            document.getElementById('dailyQuote').textContent = randomQuote;
        }

        function closeEndDayPopup() {
            document.getElementById('endDayPopup').classList.add('hidden');
            document.getElementById('reflectionText').value = '';
        }

        function submitEndDay() {
            const reflection = document.getElementById('reflectionText').value;
            const quote = document.getElementById('dailyQuote').textContent;
            const progress = parseInt(document.getElementById('progressText').textContent);

            const dayData = {
                date: AppState.tdata.date,
                day: AppState.tdata.day,
                tasks: AppState.tdata.tasks.map(task => ({
                    subject: task.subject,
                    completed: task.completed,
                    subtasks: task.subtasks
                })),
                progress: progress,
                reflection: reflection,
                quote: quote
            };

            AppState.mdata.push(dayData);
            localStorage.setItem('mdata', JSON.stringify(AppState.mdata));

            closeEndDayPopup();
            loadPreviousDays();
            alert('Day saved successfully!');
        }

        function togglePreviousDays() {
            const content = document.getElementById('previousDaysContent');
            const icon = document.getElementById('prevDaysIcon');
            content.classList.toggle('hidden');
            icon.classList.toggle('bi-chevron-down');
            icon.classList.toggle('bi-chevron-up');
        }

        function loadPreviousDays() {
            const container = document.getElementById('previousDaysList');
            
            if (AppState.mdata.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-4">No previous days recorded yet</p>';
                return;
            }

            container.innerHTML = AppState.mdata.slice().reverse().map(day => `
                <div class="border-2 border-gray-200 rounded-lg p-4 mb-3 hover:border-blue-300 transition">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-bold text-gray-800">Day ${day.day} - ${new Date(day.date).toLocaleDateString()}</h4>
                        <span class="text-sm font-semibold px-3 py-1 rounded-full ${day.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">
                            ${day.progress}% Complete
                        </span>
                    </div>
                    <div class="mb-3 space-y-2">
                        ${day.tasks.map(task => `
                            <div class="text-sm bg-gray-50 p-2 rounded">
                                <div class="flex items-center gap-2">
                                    <span class="${task.completed ? 'text-green-600' : 'text-red-600'} font-bold">
                                        ${task.completed ? '✓' : '✗'}
                                    </span>
                                    <span class="text-gray-800 font-medium">${task.subject}</span>
                                    ${task.subtasks.length > 0 ? `<span class="text-gray-500 text-xs">(${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length} subtasks)</span>` : ''}
                                </div>
                                ${task.subtasks.length > 0 ? `
                                    <div class="ml-6 mt-1 space-y-1">
                                        ${task.subtasks.map(st => `
                                            <div class="text-xs text-gray-600 flex items-center gap-1">
                                                <span class="${st.completed ? 'text-green-500' : 'text-red-500'}">•</span>
                                                ${st.name}
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${day.reflection ? `<p class="text-sm text-gray-600 italic mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">"${day.reflection}"</p>` : ''}
                    <p class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">${day.quote}</p>
                </div>
            `).join('');
        }

        // Start the app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }