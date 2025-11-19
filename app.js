// =========================================================================
// 1. DỮ LIỆU MẪU VÀ BIẾN CHUNG
// =========================================================================

let skillsRadarChartWebRating; 
let skillsRadarChartInteractionDemo;
let averageTrendChart;

// Dữ liệu mẫu (chỉ dùng cho biểu đồ demo và benchmark)
const initialSkillsData = [4.2, 3.8, 4.5, 4.0, 2.8]; // Lãnh đạo, GT, GQ, TW, TVPB
const industryDemand = [4.5, 4.0, 4.7, 4.2, 3.5]; 
const skillsLabels = [ 'Leadership', 'Communication', 'ProblemSolving', 'Teamwork', 'CriticalThinking' ];
const trendLabels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'];
const trendData = [3.5, 3.7, 3.8, 3.9, 4.0, 4.1]; // Mock Trend Data

// Tên kỹ năng thân thiện để hiển thị
const skillDisplayNames = {
    'Leadership': 'Lãnh đạo',
    'Communication': 'Giao tiếp',
    'ProblemSolving': 'Giải quyết Vấn đề',
    'Teamwork': 'Teamwork',
    'CriticalThinking': 'Tư duy Phản biện'
};

// =========================================================================
// 2. LOGIC XỬ LÝ DỮ LIỆU (CORE FUNCTIONALITY)
// =========================================================================

/**
 * Kiểm tra xem có dữ liệu hoạt động nào được ghi nhận không.
 * @returns {boolean}
 */
function hasActivityData() {
    const activitiesJson = localStorage.getItem('userActivities');
    if (!activitiesJson) return false;
    
    try {
        const activities = JSON.parse(activitiesJson);
        return activities.length > 0; 
    } catch (e) {
        return false;
    }
}

/**
 * Khởi tạo hoặc cập nhật trạng thái hoạt động trong localStorage.
 * @param {string} userName
 * @param {boolean} isNewUser - Nếu là người dùng mới, thiết lập mảng rỗng.
 */
function saveActivityData(userName, isNewUser = false) {
    if (isNewUser) {
        // Thiết lập mảng rỗng cho người dùng mới
        localStorage.setItem('userActivities', JSON.stringify([]));
    } else {
        // Đăng nhập: Không làm gì nếu đã có dữ liệu, hoặc khởi tạo rỗng nếu không phải user mới
        const activitiesJson = localStorage.getItem('userActivities');
        if (!activitiesJson) {
            localStorage.setItem('userActivities', JSON.stringify([]));
        }
    }
}

/**
 * Tính điểm trung bình (trên thang 5.0) cho từng kỹ năng từ các hoạt động đã ghi nhận.
 * @returns {object} { scores: [4.2, 3.8, ...], summary: { weakest: 'SkillA', strongest: 'SkillB', avgTotal: 4.0 } }
 */
function aggregateSkillScores(activities) {
    const scores = {}; // { Leadership: { total: X, count: Y }, ... }
    const initialScores = {};
    let totalScoreSum = 0;
    let totalScoreCount = 0;

    skillsLabels.forEach(skill => {
        initialScores[skill] = { total: 0, count: 0 };
    });

    activities.forEach(activity => {
        const skill = activity.skill;
        if (initialScores.hasOwnProperty(skill)) {
            const score5pt = (activity.points / 100) * 5.0;
            if (!scores[skill]) {
                scores[skill] = { total: 0, count: 0 };
            }
            scores[skill].total += score5pt;
            scores[skill].count += 1;
            totalScoreSum += score5pt;
            totalScoreCount += 1;
        }
    });

    let weakestSkill = null;
    let strongestSkill = null;
    let minScore = 5.1;
    let maxScore = -0.1;
    let finalScoresArray = [];

    skillsLabels.forEach((skill, index) => {
        const data = scores[skill];
        const avg = data ? data.total / data.count : 0;
        finalScoresArray.push(avg);

        if (avg > 0) {
            if (avg < minScore) {
                minScore = avg;
                weakestSkill = skill;
            }
            if (avg > maxScore) {
                maxScore = avg;
                strongestSkill = skill;
            }
        } else if (activities.length > 0 && !weakestSkill) {
             // Nếu có hoạt động nhưng skill này chưa có điểm, coi là yếu nhất
             weakestSkill = skill;
             minScore = 0;
        }
    });
    
    // Nếu không có hoạt động, đặt về null
    if (totalScoreCount === 0) {
        weakestSkill = null;
        strongestSkill = null;
    }

    return {
        scores: finalScoresArray,
        summary: {
            weakest: weakestSkill,
            strongest: strongestSkill,
            avgTotal: totalScoreCount > 0 ? totalScoreSum / totalScoreCount : 0
        }
    };
}


// =========================================================================
// 3. LOGIC CHUYỂN TRANG (AUTH.HTML)
// =========================================================================

/**
 * Xử lý khi click Google Login (Tương tự Register)
 */
function handleGoogleLogin() {
    const mockUserName = "Sinh viên Google";
    localStorage.setItem('currentUser', mockUserName);
    saveActivityData(mockUserName, true); // Thiết lập trạng thái RỖNG
    window.location.href = 'dashboard.html';
}

/**
 * Xử lý form Đăng nhập/Đăng ký.
 */
function handleAuthSubmit(event, flow) {
    event.preventDefault();
    
    if (flow === 'login') {
        const userName = document.getElementById('login-email')?.value || 'Sinh viên Tích cực';
        localStorage.setItem('currentUser', userName);
        saveActivityData(userName, false); // Giữ lại dữ liệu cũ hoặc khởi tạo nếu chưa có
        window.location.href = 'dashboard.html';
    } else if (flow === 'register') {
         const userName = document.getElementById('reg-name')?.value || 'Sinh viên Tích cực';
        localStorage.setItem('currentUser', userName);
        saveActivityData(userName, true); // Thiết lập trạng thái RỖNG
        window.location.href = 'dashboard.html';
    } else if (flow === 'forgot') {
        renderFrame('reset');
    } else if (flow === 'reset') {
        renderFrame('login');
    }
}

/**
 * Logic kiểm tra hash và render khung tương ứng.
 */
function initializeAuthPage() {
    const hash = window.location.hash.substring(1);
    if (hash === 'register') {
         renderFrame('register');
    } else {
         renderFrame('login');
    }
}

// =========================================================================
// 4. LOGIC DASHBOARD (DASHBOARD.HTML)
// =========================================================================

/**
 * Tải dữ liệu người dùng và cập nhật Dashboard.
 */
function loadUserDashboardData() {
    const activitiesJson = localStorage.getItem('userActivities');
    const activities = activitiesJson ? JSON.parse(activitiesJson) : [];
    
    const { scores: skillScores, summary } = aggregateSkillScores(activities);

    const activityCount = summary.totalScoreCount || activities.length;
    const avgScore = summary.avgTotal;
    
    // Cập nhật STATS CARD
    document.getElementById('stat-avg-score-value').textContent = avgScore.toFixed(2) === '0.00' ? 'N/A' : avgScore.toFixed(2);
    document.getElementById('stat-logged-activity-count-value').textContent = activityCount;
    
    // MÔ PHỎNG: Cập nhật Huy hiệu và Mục tiêu
    if (activityCount >= 1 && avgScore > 3.0) { // Giả định: Đã ghi nhận 1 hoạt động và điểm TB > 3.0
        document.getElementById('stat-badges-value').textContent = '1';
        document.querySelector('#stat-badges p.stat-sub-text').textContent = 'Chiến Binh Sơ Cấp';
    } else {
         document.getElementById('stat-badges-value').textContent = '0';
         document.querySelector('#stat-badges p.stat-sub-text').textContent = 'Bắt đầu ghi nhận';
    }

    if (summary.strongest && skillScores[skillsLabels.indexOf('Leadership')] > 4.0) {
        document.getElementById('stat-goal-value').textContent = '80%';
        document.querySelector('#stat-goal-progress p.stat-sub-text').textContent = `Leadership ${skillScores[0].toFixed(1)} / 5.0`;
    } else {
         document.getElementById('stat-goal-value').textContent = '0%';
         document.querySelector('#stat-goal-progress p.stat-sub-text').textContent = 'Chưa thiết lập mục tiêu';
    }
    
    // Cập nhật RECCOMENDATION SPOTLIGHT
    const weakestScore = summary.weakest ? skillScores[skillsLabels.indexOf(summary.weakest)] : 0;
    const weakestName = summary.weakest ? skillDisplayNames[summary.weakest] : 'Kỹ năng';

    document.getElementById('reco-priority-value').textContent = `Ưu tiên: ${weakestName} (${weakestScore.toFixed(1)})`;
    document.getElementById('reco-strongest-value').textContent = `Mạnh nhất: ${skillDisplayNames[summary.strongest]} (${skillScores[skillsLabels.indexOf(summary.strongest)].toFixed(1)})`;
    
    // TRẢ VỀ DỮ LIỆU THỰC TẾ CHO BIỂU ĐỒ
    return { dynamicSkillScores: skillScores };
}

/**
 * Khởi tạo biểu đồ và áp dụng ngôn ngữ.
 */
function initializeChartsAndApplyLanguage() {
    const hasDataFlag = hasActivityData();
    let dynamicData = { dynamicSkillScores: initialSkillsData }; // Dùng mock data nếu chưa có

    if (hasDataFlag) {
        // TẢI VÀ TÍNH TOÁN DỮ LIỆU THỰC TẾ
        dynamicData = loadUserDashboardData(); 

        document.getElementById('data-content-area').classList.remove('chart-container-hidden');
        document.getElementById('empty-state-message').classList.add('chart-container-hidden');
        
    } else {
        // EMPTY STATE
        document.getElementById('data-content-area').classList.add('chart-container-hidden');
        document.getElementById('empty-state-message').classList.remove('chart-container-hidden');
        updateEmptyStats();
    }
    
    // KHỞI TẠO BIỂU ĐỒ
    const currentScores = dynamicData.dynamicSkillScores;
    
    // 1. WEB RATING CHART (REAL DATA)
    const webRatingDynamicData = {
        labels: skillsLabels.map((label, i) => `${skillDisplayNames[label]} (${currentScores[i].toFixed(1)})`),
        datasets: [{
            label: 'Điểm Của Bạn (Web Rating)',
            data: currentScores,
            fill: true,
            backgroundColor: 'rgba(90, 24, 154, 0.4)', 
            borderColor: 'var(--color-primary)',
            pointBackgroundColor: 'var(--color-primary)', 
            pointBorderColor: '#fff',
        },
        { 
            label: 'Mức Yêu cầu Ngành',
            data: industryDemand,
            fill: false,
            borderColor: 'rgba(255, 215, 0, 0.7)', 
            pointRadius: 0, borderDash: [5, 5], borderWidth: 1
        }]
    };
    
    var webRatingCtx = document.getElementById('skillsRadarChartWebRating').getContext('2d');
    skillsRadarChartWebRating = new Chart(webRatingCtx, getRadarChartConfig(webRatingDynamicData, 'var(--color-text-dark)', 0.4)); 

    // 2. LINE CHART (TREND) - VẪN DÙNG MOCK DATA
    var trendCtx = document.getElementById('averageTrendChart').getContext('2d');
    averageTrendChart = new Chart(trendCtx, trendConfig);
    
    // 3. INTERACTION DEMO CHART (VẪN DÙNG MOCK DATA)
    const interactionDemoDynamicData = {
        labels: skillsLabels.slice(0, 4).map((label, i) => `${skillDisplayNames[label]} (${initialSkillsData[i].toFixed(1)})`),
        datasets: [{
            label: 'Điểm Tương tác (Demo)',
            data: initialSkillsData.slice(0, 4),
            fill: true,
            backgroundColor: 'rgba(79, 154, 255, 0.5)', 
            borderColor: 'var(--color-accent)', pointBackgroundColor: 'var(--color-accent)', pointBorderColor: '#fff', borderWidth: 2
        }]
    };
    var demoCtx = document.getElementById('skillsRadarChartInteractionDemo').getContext('2d');
    skillsRadarChartInteractionDemo = new Chart(demoCtx, getRadarChartConfig(interactionDemoDynamicData, 'var(--color-text-dark)', 0.5)); 
    
    resetChartData(); // Khởi tạo sliders
    applyLanguageDashboard();
}

// =========================================================================
// 5. LOGIC CHUYỂN ĐỔI NGÔN NGỮ VÀ CHART UTIL (GIỮ NGUYÊN)
// =========================================================================

const DashboardTranslations = { /* ... (Giữ nguyên khối dịch thuật) ... */ };
function updateChartLabels(lang) { /* ... (Giữ nguyên logic cập nhật nhãn) ... */ }
const getRadarChartConfig = (data, labelColor, fillAlpha) => ({ /* ... (Giữ nguyên config) ... */ });
const trendConfig = { /* ... (Giữ nguyên config) ... */ };
function updateChartData(index, rawValue) { /* ... (Giữ nguyên logic slider) ... */ }
function resetChartData() { /* ... (Giữ nguyên logic reset slider) ... */ }
function updateEmptyStats() { /* ... (Giữ nguyên logic update empty stats) ... */ }
function applyLanguageDashboard() { /* ... (Giữ nguyên logic áp dụng ngôn ngữ) ... */ }

document.addEventListener('DOMContentLoaded', () => {
    // Chỉ gọi initializeAuthPage nếu đây là trang auth.html
    if (document.body.classList.contains('auth-page')) {
        initializeAuthPage();
    }
});