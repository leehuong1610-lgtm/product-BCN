document.addEventListener('DOMContentLoaded', function() {

    // --- DỮ LIỆU GIẢ LẬP (DATABASE) ---
    // Đây là dữ liệu giả lập, thay vì gọi từ Back-end
    // Đây là kết quả sau khi sinh viên đã NHẬP và được XÁC THỰC
    const validatedActivities = [
        {
            id: 1,
            activity: "Tổ chức Hội chợ Sách 2024",
            role: "Trưởng ban Hậu cần",
            tags: ["Leadership", "ProblemSolving", "Teamwork"],
            validation: {
                validator: "Thầy An (Cố vấn CLB)",
                rating: 5, // Điểm cho kỹ năng chính (Leadership)
                comment: "Rất chủ động trong việc điều phối, xử lý khủng hoảng (mất điện) rất nhanh."
            }
        },
        {
            id: 2,
            activity: "Dự án Thiết kế Web môn HCI",
            role: "Nhóm trưởng",
            tags: ["Leadership", "Teamwork"],
            validation: {
                validator: "Bạn B (Thành viên nhóm)",
                rating: 4,
                comment: "Phân công công việc rõ ràng, luôn lắng nghe ý kiến thành viên."
            }
        },
        {
            id: 3,
            activity: "Dự án Thiết kế Web môn HCI",
            role: "Thành viên (Thiết kế)",
            tags: ["Teamwork"],
            validation: {
                validator: "Bạn A (Nhóm trưởng)",
                rating: 4,
                comment: "Hoàn thành task đúng hạn, chủ động hỗ trợ bạn khác."
            }
        },
        {
            id: 4,
            activity: "Cuộc thi 'Rung Chuông Vàng'",
            role: "Thành viên Ban Nội dung",
            tags: ["ProblemSolving"],
            validation: {
                validator: "Chị C (Trưởng BTC)",
                rating: 4,
                comment: "Phát hiện 3 lỗi sai trong bộ đề, giúp BTC sửa kịp thời."
            }
        }
    ];

    // --- PHẦN 1: ĐO LƯỜNG (TÍNH TOÁN VÀ VẼ BIỂU ĐỒ) ---
    
    // Hàm tính điểm trung bình từ dữ liệu
    function calculateAverageScores(activities) {
        const scores = {
            Teamwork: { total: 0, count: 0, average: 0 },
            Leadership: { total: 0, count: 0, average: 0 },
            ProblemSolving: { total: 0, count: 0, average: 0 },
            Communication: { total: 0, count: 0, average: 0 },
            TimeManagement: { total: 0, count: 0, average: 0 },
            Creativity: { total: 0, count: 0, average: 0 }
        };

        activities.forEach(item => {
            // Giả định: điểm validation là cho kỹ năng đầu tiên trong tag
            // (Trong hệ thống thật, validator sẽ chấm điểm riêng cho từng kỹ năng)
            const mainSkill = item.tags[0]; 
            if (scores[mainSkill]) {
                scores[mainSkill].total += item.validation.rating;
                scores[mainSkill].count++;
            }
            // Cũng tính điểm cho các kỹ năng tag phụ (giả sử cùng điểm)
            item.tags.slice(1).forEach(tag => {
                 if (scores[tag] && item.tags.includes(tag)) {
                    scores[tag].total += item.validation.rating;
                    scores[tag].count++;
                 }
            });
        });

        // Tính điểm trung bình
        for (let skill in scores) {
            if (scores[skill].count > 0) {
                scores[skill].average = (scores[skill].total / scores[skill].count).toFixed(1);
            }
        }
        return scores;
    }

    const calculatedScores = calculateAverageScores(validatedActivities);

    // Dùng Chart.js để vẽ biểu đồ
    const ctx = document.getElementById('skillRadarChart').getContext('2d');
    const skillRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Teamwork', 'Leadership', 'Giải quyết vấn... (PS)', 'Giao tiếp (Comms)', 'QL Thời gian (Time)', 'Sáng tạo (Creative)'],
            datasets: [{
                label: 'Điểm Kỹ năng (Đã xác thực)',
                data: [
                    calculatedScores.Teamwork.average,
                    calculatedScores.Leadership.average,
                    calculatedScores.ProblemSolving.average,
                    calculatedScores.Communication.average,
                    calculatedScores.TimeManagement.average,
                    calculatedScores.Creativity.average
                ],
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 123, 255, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: '#ddd' },
                    grid: { color: '#ddd' },
                    pointLabels: { fontSize: 14, fontColor: '#333' },
                    suggestedMin: 0,
                    suggestedMax: 5,
                    ticks: {
                        stepSize: 1,
                        backdropColor: 'transparent'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });


    // --- PHẦN 2: GHI NHẬN (HIỂN THỊ KHO BẰNG CHỨNG) ---
    const evidenceList = document.getElementById('evidence-list');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Hàm hiển thị danh sách bằng chứng (lọc theo skill)
    function renderEvidence(filterSkill = 'all') {
        evidenceList.innerHTML = ''; // Xóa list cũ

        const filteredList = activities => {
            if (filterSkill === 'all') {
                return activities;
            }
            return activities.filter(item => item.tags.includes(filterSkill));
        };

        if (filteredList(validatedActivities).length === 0) {
             evidenceList.innerHTML = '<p>Không có bằng chứng nào cho kỹ năng này.</p>';
             return;
        }

        filteredList(validatedActivities).forEach(item => {
            const evidenceCard = document.createElement('div');
            evidenceCard.className = 'evidence-item';
            
            // Tạo tag HTML
            const tagsHTML = item.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');

            evidenceCard.innerHTML = `
                <h3>${item.activity}</h3>
                <p class="role"><strong>Vai trò:</strong> ${item.role}</p>
                <div class="tags">${tagsHTML}</div>
                <div class="validation">
                    <strong>Đã xác thực bởi:</strong> ${item.validation.validator} (⭐️ ${item.validation.rating})
                    <p><em>" ${item.validation.comment} "</em></p>
                </div>
            `;
            evidenceList.appendChild(evidenceCard);
        });
    }

    // Thêm sự kiện click cho các nút lọc
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Xóa class 'active' khỏi tất cả
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Thêm class 'active' cho nút vừa nhấn
            button.classList.add('active');
            
            // Lấy data-skill
            const skillToFilter = button.getAttribute('data-skill');
            renderEvidence(skillToFilter);
        });
    });

    // Chạy lần đầu tiên (hiển thị tất cả)
    renderEvidence('all');

});