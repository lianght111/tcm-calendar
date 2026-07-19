/**
 * app.js - UI渲染与交互
 */

let currentYear, currentMonth;

// 二十八宿名，按日序循环。以2000-01-01为“角”宿（序号0）作简易推算
const XIU_28 = ['角','亢','氐','房','心','尾','箕','斗','牛','女','虚','危','室','壁','奎','娄','胃','昴','毕','觜','参','井','鬼','柳','星','张','翼','轸'];
function getDayXiu(date) {
    const base = new Date(2000, 0, 1);
    const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const baseUtc = Date.UTC(2000, 0, 1);
    const diffDays = Math.round((utcDate - baseUtc) / 86400000);
    return XIU_28[((diffDays % 28) + 28) % 28] + '宿';
}

document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    loadTheme();
    renderCalendar();
    renderSidebar();
    setupKeyboard();
});

// =================== 主题 ===================
function loadTheme() {
    const t = localStorage.getItem('tcm-calendar-theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
}

function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tcm-calendar-theme', next);
}

// =================== 键盘 ===================
function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft' && !document.getElementById('modal-overlay').classList.contains('show')) navigateMonth(-1);
        if (e.key === 'ArrowRight' && !document.getElementById('modal-overlay').classList.contains('show')) navigateMonth(1);
        if (e.ctrlKey && e.key === 't') { e.preventDefault(); goToToday(); }
    });
}

// =================== 导航 ===================
function goToToday() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    renderCalendar();
    renderSidebar();
}

function navigateMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
    renderSidebar();
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('open');
    let ol = document.querySelector('.sidebar-overlay');
    if (!ol) {
        ol = document.createElement('div');
        ol.className = 'sidebar-overlay';
        ol.onclick = toggleSidebar;
        document.body.appendChild(ol);
    }
    ol.classList.toggle('show');
}

// =================== 侧边栏 ===================
function renderSidebar() {
    renderTodaySummary(new Date());
    renderWuYunSummary(new Date());
}

function renderTodaySummary(date) {
    const el = document.getElementById('today-summary');
    if (!el) return;
    const dGZ = getDayGanZhi(date);
    const mGZ = getMonthGanZhi(date);
    const yGZ = getYearGanZhi(date);
    const hGZ = getHourGanZhi(date, date.getHours());
    const termInfo = getCurrentSolarTerm(date);
    const naYin = getNaYin(dGZ.sexagenaryNum);
    const dWx = getGanWuXing(dGZ.ganIdx);
    const zWx = getZhiWuXing(dGZ.zhiIdx);
    const yWx = getGanWuXing(yGZ.ganIdx);
    const mWx = getGanWuXing(mGZ.ganIdx);
    const hWx = getGanWuXing(hGZ.ganIdx);

    const curTerm = termInfo.current;
    const nextTerm = termInfo.next;
    const lunar = getLunarDate(date);

    el.innerHTML = `
        <div class="info-item"><span class="label">公历:</span> ${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日 星期${['日','一','二','三','四','五','六'][date.getDay()]}</div>
        <div class="info-item"><span class="label">农历:</span> ${lunar ? (lunar.yearGanZhi + '年 ' + lunar.yearAnimal + '年 ' + lunar.monthName + lunar.dayName) : ''}</div>
        <div class="info-item"><span class="label">年干支:</span> ${yGZ.ganzhi}年 <span class="tag ${getWuXingColor(yWx.wuXingIdx)}">${yWx.wuXing}</span> ${getNaYin(yGZ.sexagenaryNum)}</div>
        <div class="info-item"><span class="label">月干支:</span> ${mGZ.ganzhi}月 <span class="tag ${getWuXingColor(mWx.wuXingIdx)}">${mWx.wuXing}</span></div>
        <div class="info-item"><span class="label">日干支:</span> ${dGZ.ganzhi}日 <span class="tag ${getWuXingColor(dWx.wuXingIdx)}">${dWx.wuXing}</span> <span class="${dWx.yinYang==='阳'?'yang-badge':'yin-badge'}">${dWx.yinYang}</span></div>
        <div class="info-item"><span class="label">时干支:</span> ${hGZ.ganzhi}时 <span class="${hWx.yinYang==='阳'?'yang-badge':'yin-badge'}">${hWx.yinYang}${hWx.wuXing}</span> (${hGZ.shiChen.name})</div>
        <div class="info-item"><span class="label">纳音:</span> ${naYin}</div>
        ${curTerm ? `<div class="info-item"><span class="label">当前节气:</span> ${curTerm.name} (${curTerm.type})</div>` : ''}
        ${nextTerm ? `<div class="info-item"><span class="label">下一节气:</span> ${nextTerm.name} ${nextTerm.date.getMonth()+1}/${nextTerm.date.getDate()}</div>` : ''}
        ${getWuMenShiBian(date) ? `<div class="info-item"><span class="label">五门十变:</span> <span style="font-size:0.8em;">${getWuMenShiBian(date).formula}</span> → 合化${getWuMenShiBian(date).huaWuxing}</div>` : ''}
    `;
}

function renderWuYunSummary(date) {
    const el = document.getElementById('wuyun-summary');
    if (!el) return;
    const wy = getWuYunLiuQiForDate(date);
    const ym = wy.yearMovement;
    const gq = wy.guestQi;
    el.innerHTML = `
        <div class="info-item"><span class="label">岁运:</span> ${ym.wuXing}运${ym.excess}</div>
        <div class="info-item"><span class="label">司天:</span> ${gq.siTian}</div>
        <div class="info-item"><span class="label">在泉:</span> ${gq.zaiQuan}</div>
        <div class="info-item"><span class="label">主运:</span> ${wy.currentHostMove.name} ${wy.currentHostMove.wuXing}</div>
        <div class="info-item"><span class="label">客运:</span> ${wy.currentGuestMove.name} ${wy.currentGuestMove.wuXing}</div>
        <div class="info-item"><span class="label">主气:</span> ${wy.currentHostQ.qi}</div>
        <div class="info-item"><span class="label">客气:</span> ${wy.currentGuestQ.qi}${wy.currentGuestQ.isSiTian?' (司天)':''}${wy.currentGuestQ.isZaiQuan?' (在泉)':''}</div>
    `;
}

// =================== 日历渲染 ===================
function renderCalendar() {
    document.getElementById('current-month-title').textContent =
        `${currentYear}年 ${currentMonth + 1}月`;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDow = firstDay.getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevLast = new Date(currentYear, currentMonth, 0).getDate();

    // 上月
    for (let i = startDow - 1; i >= 0; i--) {
        grid.innerHTML += buildDayCell(new Date(currentYear, currentMonth - 1, prevLast - i), true);
    }
    // 本月
    for (let d = 1; d <= totalDays; d++) {
        grid.innerHTML += buildDayCell(new Date(currentYear, currentMonth, d), false);
    }
    // 下月
    const remain = 42 - (startDow + totalDays);
    for (let i = 1; i <= remain; i++) {
        grid.innerHTML += buildDayCell(new Date(currentYear, currentMonth + 1, i), true);
    }
}

function buildDayCell(date, isOther) {
    const dGZ = getDayGanZhi(date);
    const dWx = getGanWuXing(dGZ.ganIdx);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const dayNum = date.getDate();
    const naYinDay = getNaYin(dGZ.sexagenaryNum);

    // 农历
    const lunar = getLunarDate(date);
    let lunarHtml = '';
    if (lunar) {
        const special = (lunar.day === 1) ? ' lunar-first' : '';
        const midMonth = (lunar.day === 15) ? ' lunar-fifteen' : '';
        lunarHtml = `<span class="lunar-date${special}${midMonth}">${lunar.monthName}${lunar.dayName}</span>`;
    }

    // 是否今天
    const now = new Date(); now.setHours(0,0,0,0);
    const dOnly = new Date(date); dOnly.setHours(0,0,0,0);
    const isToday = dOnly.getTime() === now.getTime();

    // 当前时辰（仅今天）
    let currentShiChenHtml = '';
    let xiuHtml = '';
    if (isToday) {
        const curHour = new Date().getHours();
        const curHg = getHourGanZhi(new Date(), curHour);
        currentShiChenHtml = `<span class="tag current-shichen">当前：${curHg.shiChen.name} ${curHg.ganzhi}</span>`;
    }
    xiuHtml = `<span class="tag xiu-tag">${getDayXiu(date)}</span>`;

    // 节气
    const term = getSolarTermOnDate(date);
    let termHtml = '';
    if (term) {
        const tClass = term.type === '节' ? 'jieqi' : 'solar-term';
        termHtml = `<span class="tag ${tClass}">${term.name}${term.type}</span>`;
    }

    const cls = [
        'day-cell',
        isOther ? 'other-month' : '',
        isToday ? 'today' : '',
        isWeekend && !isOther ? 'weekend' : ''
    ].filter(Boolean).join(' ');

    const wxc = getWuXingColor(dWx.wuXingIdx);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    return `
    <div class="${cls}" onclick="openDayDetail('${dateKey}')" title="${dGZ.ganzhi}日">
        <span class="wuxing-indicator" style="background: var(--${wxc})"></span>
        <span class="solar-date">${dayNum}</span>
        <span class="ganzhi">${dGZ.ganzhi}</span>
        ${lunarHtml}
        <div class="tag-row">
            <span class="tag ${wxc}">${dWx.wuXing}${dWx.yinYang}</span>
            ${naYinDay ? `<span class="tag" style="background:#f0f0f0;color:#666;">${naYinDay}</span>` : ''}
            ${xiuHtml}
            ${currentShiChenHtml}
            ${termHtml}
        </div>
    </div>`;
}

// =================== 弹窗 ===================
function openDayDetail(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m, d);

    const dayGZ = getDayGanZhi(date);
    const monthGZ = getMonthGanZhi(date);
    const yearGZ = getYearGanZhi(date);
    const dWx = getGanWuXing(dayGZ.ganIdx);
    const zWx = getZhiWuXing(dayGZ.zhiIdx);
    const mWx = getGanWuXing(monthGZ.ganIdx);
    const yWx = getGanWuXing(yearGZ.ganIdx);

    const naYinDay = getNaYin(dayGZ.sexagenaryNum);
    const naYinYear = getNaYin(yearGZ.sexagenaryNum);
    const wy = getWuYunLiuQiForDate(date);
    const allHours = getAllHourAcupointInfo(date);
    const wumen = getWuMenShiBian(date);
    const term = getSolarTermOnDate(date);
    const termInfo = getCurrentSolarTerm(date);

    // 当前时辰
    const now = new Date();
    const curHour = now.getHours();
    let curShiChenIdx = 0;
    if (curHour >= 23 || curHour < 1) curShiChenIdx = 0;
    else if (curHour >= 1 && curHour < 3) curShiChenIdx = 1;
    else curShiChenIdx = Math.floor((curHour + 1) / 2);
    const isTodayCheck = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();

    const weekDays = ['日','一','二','三','四','五','六'];
    const lunarDateInfo = getLunarDate(date);

    document.getElementById('modal-title').textContent =
        `${y}年${m+1}月${d}日 星期${weekDays[date.getDay()]} ${dayGZ.ganzhi}日 · ${naYinDay}` +
        (lunarDateInfo ? ` · ${lunarDateInfo.yearAnimal}年${lunarDateInfo.monthName}${lunarDateInfo.dayName}` : '');

    let html = '';

    // ---- 干支信息 ----
    html += `<div class="detail-section">
        <h3>📌 干支信息</h3>
        <div class="detail-grid">
            <div class="detail-card">
                <div class="card-label">年干支 / 纳音</div>
                <div class="card-value">${yearGZ.ganzhi} <span class="tag ${getWuXingColor(yWx.wuXingIdx)}">${yWx.wuXing}</span></div>
                <div style="font-size:0.7em;color:var(--text-light);margin-top:4px;">${naYinYear}</div>
            </div>
            <div class="detail-card">
                <div class="card-label">月干支</div>
                <div class="card-value">${monthGZ.ganzhi} <span class="tag ${getWuXingColor(mWx.wuXingIdx)}">${mWx.wuXing}</span></div>
                <div style="font-size:0.7em;color:var(--text-light);margin-top:4px;">节气月第${monthGZ.lunarMonth}月</div>
            </div>
            <div class="detail-card">
                <div class="card-label">日干支 / 纳音</div>
                <div class="card-value">${dayGZ.ganzhi} <span class="tag ${getWuXingColor(dWx.wuXingIdx)}">${dWx.wuXing}</span></div>
                <div style="font-size:0.7em;color:var(--text-light);margin-top:4px;">${naYinDay} | 六十甲子第${dayGZ.sexagenaryNum+1}位</div>
            </div>
            <div class="detail-card">
                <div class="card-label">农历</div>
                <div class="card-value">${lunarDateInfo ? (lunarDateInfo.yearGanZhi + '年 ' + lunarDateInfo.yearAnimal + '年') : ''}</div>
                <div style="font-size:0.7em;color:var(--text-light);margin-top:4px;">${lunarDateInfo ? (lunarDateInfo.monthName + lunarDateInfo.dayName) : ''}</div>
            </div>
            <div class="detail-card">
                <div class="card-label">阴阳五行</div>
                <div class="card-value">
                    日干: <span class="${dWx.yinYang==='阳'?'yang-badge':'yin-badge'}">${dWx.yinYang}${dWx.wuXing}</span>
                    日支: <span class="${zWx.yinYang==='阳'?'yang-badge':'yin-badge'}">${zWx.yinYang}${zWx.wuXing}</span>
                </div>
            </div>
        </div>
    </div>`;

    // ---- 万年历信息 ----
    const dayXiu = getDayXiu(date);
    html += `<div class="detail-section">
        <h3>📜 万年历信息</h3>
        <div class="detail-grid">
            <div class="detail-card"><div class="card-label">二十八宿</div><div class="card-value">${dayXiu}</div></div>
            <div class="detail-card"><div class="card-label">日干支纳音</div><div class="card-value">${naYinDay}</div></div>
            ${lunarDateInfo ? `<div class="detail-card"><div class="card-label">农历</div><div class="card-value">${lunarDateInfo.yearGanZhi}年 ${lunarDateInfo.yearAnimal} ${lunarDateInfo.monthName}${lunarDateInfo.dayName}</div></div>` : ''}
        </div>
    </div>`;

    // ---- 节气 ----
    if (term || termInfo.current) {
        const ct = term || termInfo.current;
        html += `<div class="detail-section">
            <h3>🌤 节气</h3>
            <div class="detail-grid">
                <div class="detail-card" style="grid-column:1/-1;">
                    <div class="card-value">
                        ${ct.name} (${ct.type || ''})
                        ${termInfo.next ? ` → 下一节气: ${termInfo.next.name} (${termInfo.next.date.getMonth()+1}/${termInfo.next.date.getDate()})` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ---- 五运六气 ----
    html += `<div class="detail-section">
        <h3>🌿 五运六气</h3>
        <div class="detail-grid">
            <div class="detail-card"><div class="card-label">岁运</div><div class="card-value">${wy.yearMovement.wuXing}运${wy.yearMovement.excess}</div></div>
            <div class="detail-card"><div class="card-label">当前主运</div><div class="card-value">${wy.currentHostMove.name}·${wy.currentHostMove.wuXing}</div></div>
            <div class="detail-card"><div class="card-label">当前客运</div><div class="card-value">${wy.currentGuestMove.name}·${wy.currentGuestMove.wuXing}</div></div>
            <div class="detail-card"><div class="card-label">当前主气</div><div class="card-value">${wy.currentHostQ.qi}</div></div>
            <div class="detail-card"><div class="card-label">当前客气</div><div class="card-value">${wy.currentGuestQ.qi}${wy.currentGuestQ.isSiTian?'(司天)':''}${wy.currentGuestQ.isZaiQuan?'(在泉)':''}</div></div>
            <div class="detail-card"><div class="card-label">司天/在泉</div><div class="card-value" style="font-size:0.9em;">${wy.guestQi.siTian}/${wy.guestQi.zaiQuan}</div></div>
        </div>
    </div>`;

    // ---- 五门十变 ----
    if (wumen) {
        html += `<div class="detail-section wumen-section">
            <h3>⚫ 五门十变</h3>
            <div style="padding:14px;text-align:center;">
                <div style="font-size:1.15em;font-weight:700;color:#2c3e50;margin-bottom:6px;">${wumen.formula}</div>
                <div style="font-size:1.05em;margin-bottom:4px;">合化 <span class="wx-highlight wx-${wumen.huaWuxing}">${wumen.huaWuxing}</span></div>
                <div style="color:#666;font-size:0.85em;">${wumen.description}</div>
            </div>
        </div>`;
    }

    // ---- 时辰开穴详情表 ----
    html += `<div class="detail-section">
        <h3>⏰ 时辰开穴 · 灵龟八法 & 子午流注
            ${isTodayCheck ? `<span class="current-badge">当前：${SHI_CHEN[curShiChenIdx].name} (${SHI_CHEN[curShiChenIdx].start}:00-${SHI_CHEN[curShiChenIdx].end}:00)</span>` : ''}
        </h3>
        <div style="font-size:0.7em;color:var(--text-light);margin-bottom:8px;">灵龟八法含主穴、配穴及卦性；纳子法含主配穴、补母穴与泻子穴；纳甲法按徐凤《针灸大全》逐日按时定穴，阳日阳时/阴日阴时开穴，阴阳不遇时按天干五合取夫妻互用穴</div>
        <div class="hour-table-wrapper">
        <table class="hour-table">
            <thead><tr>
                <th>时辰</th><th>时间</th><th>时干支</th><th>时干属性</th><th>当令经络</th>
                <th>灵龟八法(开穴/配穴/卦)</th><th>纳甲法(开穴/互用)</th><th>纳子法(主/配)</th>
            </tr></thead><tbody>`;

    allHours.forEach(h => {
        const isCur = isTodayCheck && h.shiChenIdx === curShiChenIdx;
        const trCls = isCur ? 'hour-current' : '';
        const lg = h.linggui;
        const fi = lg.fullInfo;

        // 灵龟八法格
        let lgHtml = '<span class="na-closed">-</span>';
        if (lg.acupoint) {
            lgHtml = `<div class="lg-main"><b>${lg.acupoint.code}</b> ${lg.acupoint.name}
                <span title="${fi ? fi.trigramName : ''}" style="font-size:1.2em;margin-left:2px;">${fi ? fi.trigramSymbol : ''}</span>
                <br><small>${lg.acupoint.meridian} · 通${lg.acupoint.vessel}<em class="wx-mini wx-${lg.acupoint.wuXing}">${lg.acupoint.wuXing}</em></small></div>`;
            if (lg.couple) {
                lgHtml += `<div class="lg-couple"><small>配 ${lg.couple.code} ${lg.couple.name}<em class="wx-mini wx-${LINGGUI_ACUPOINTS[lg.couple.num].wuXing}">${LINGGUI_ACUPOINTS[lg.couple.num].wuXing}</em></small></div>`;
            }
        }

        // 纳甲法格
        let njHtml = '<span class="na-closed">-</span>';
        if (h.najia.mainPoint) {
            const pt = h.najia.mainPoint;
            njHtml = `<div class="na-main"><b>${pt.code}</b> ${pt.name}
                <br><small>${pt.meridian} · ${pt.pointType}<em class="wx-mini wx-${pt.wuXing}">${pt.wuXing}</em></small>
                ${pt.yuan ? `<br><small class="na-yuan">返本还原：${pt.yuan.name}(${pt.yuan.code}) 原穴<em class="wx-mini wx-${pt.yuan.wuXing}">${pt.yuan.wuXing}</em></small>` : ''}
                ${pt.note ? `<br><small class="na-note">${pt.note}</small>` : ''}
            </div>`;
        }
        if (h.najia.huyongPoint) {
            const pt = h.najia.huyongPoint;
            const isHuyong = h.najia.hasHuyong;
            const huyongClass = isHuyong ? 'huyong-real' : 'huyong-common';
            const huyongLabel = isHuyong ? '夫妻互用' : '合日参考';
            njHtml += `<div class="na-huyong ${huyongClass}">
                <span class="huyong-mark">${huyongLabel}</span> ${pt.meridian.replace(/^(手|足)/,'')}
                <br><b>${pt.code}</b> ${pt.name} · ${pt.pointType}<em class="wx-mini wx-${pt.wuXing}">${pt.wuXing}</em>
                ${pt.yuan ? `<br><small class="na-yuan">返本：${pt.yuan.name}(${pt.yuan.code})<em class="wx-mini wx-${pt.yuan.wuXing}">${pt.yuan.wuXing}</em></small>` : ''}
            </div>`;
        }

        // 纳子法格
        let nzHtml = '<span class="na-closed">-</span>';
        if (h.nazi) {
            const main = h.nazi.mainPoint;
            const acc = h.nazi.accompanyPoint;
            nzHtml = `<div class="nz-main"><b>主</b> ${main.code} ${main.name} <small>${main.pointType}<em class="wx-mini wx-${main.wuXing}">${main.wuXing}</em></small></div>
                <div class="nz-accompany"><small>配</small> ${acc.code} ${acc.name} <small>${acc.pointType}<em class="wx-mini wx-${acc.wuXing}">${acc.wuXing}</em></small></div>`;
        }

        html += `<tr class="${trCls}">
            <td><strong>${h.shiChenName}</strong></td>
            <td>${h.timeRange}</td>
            <td style="font-weight:600;" class="${h.shiZhiYinYang === '阳' ? 'shi-yang' : 'shi-yin'}">${h.ganzhi}<br><small style="color:#666;font-weight:400;">${h.shiGan}${h.shiGanYinYang}${h.shiGanWuXing}·${h.shiZhi}${h.shiZhiWuXing}</small></td>
            <td style="color:${getWuXingColor(h.shiGanWuXing)};font-weight:600;">${h.shiGanWuXing}(${h.shiGanYinYang})</td>
            <td class="meridian-name">${h.meridianCN}<br><small>${h.meridian}</small></td>
            <td class="lg-cell">${lgHtml}</td>
            <td class="najia-cell" style="font-size:0.78em;">${njHtml}</td>
            <td class="nazi-cell" style="font-size:0.78em;">${nzHtml}</td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;

    // ---- 灵龟八法配穴总表 ----
    html += `<div class="detail-section">
        <h3>🐢 灵龟八法 · 八脉交会穴配伍</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px;padding:14px;">`;
    LINGGUI_COUPLES.forEach(cp => {
        const a = LINGGUI_ACUPOINTS[cp.a];
        const b = LINGGUI_ACUPOINTS[cp.b];
        const fiA = LINGGUI_FULL_INFO[cp.a];
        const fiB = LINGGUI_FULL_INFO[cp.b];
        html += `<div class="trigram-pair-card">
            <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:6px;">
                <span style="font-weight:700;">${cp.a}.${a.name} <small style="color:#888;">(${fiA.trigramSymbol}${fiA.trigram})</small></span>
                <span style="font-size:1.3em;color:#bbb;">↔</span>
                <span style="font-weight:700;">${cp.b}.${b.name} <small style="color:#888;">(${fiB.trigramSymbol}${fiB.trigram})</small></span>
            </div>
            <div style="font-size:0.85em;color:#555;">${cp.vesselA} ↔ ${cp.vesselB}</div>
            <div style="font-size:0.78em;color:#999;">${cp.relation}</div>
        </div>`;
    });
    html += `</div></div>`;

    // ---- 纳子法补泻详表 ----
    html += `<div class="detail-section">
        <h3>💉 纳子法 · 十二经主配穴与补泻</h3>
        <div style="overflow-x:auto;">
        <table class="hour-table">
            <thead><tr>
                <th>时辰</th><th>经络</th><th>主穴(子穴)</th><th>配穴(表里)</th><th>补法(母穴)</th><th>泻法(子穴)</th>
            </tr></thead><tbody>`;
    allHours.forEach(h => {
        const nz = h.nazi;
        if (!nz) return;
        const isCur = isTodayCheck && h.shiChenIdx === curShiChenIdx;
        const wxTag = (pt) => `<em class="wx-mini wx-${pt.wuXing}">${pt.wuXing}</em>`;
        html += `<tr class="${isCur ? 'hour-current' : ''}">
            <td>${h.shiChenName}</td><td>${nz.meridian}</td>
            <td class="acupoint-highlight">${nz.mainPoint.name}(${nz.mainPoint.code}) ${wxTag(nz.mainPoint)}<br><small>${nz.mainPoint.pointType}</small></td>
            <td>${nz.accompanyPoint.name}(${nz.accompanyPoint.code}) ${wxTag(nz.accompanyPoint)}<br><small>${nz.accompanyPoint.pointType}</small></td>
            <td style="color:#27ae60;">${nz.supplementPoint.name}(${nz.supplementPoint.code}) ${wxTag(nz.supplementPoint)}<br><small>${nz.supplementPoint.pointType}</small></td>
            <td style="color:#e74c3c;">${nz.drainPoint.name}(${nz.drainPoint.code}) ${wxTag(nz.drainPoint)}<br><small>${nz.drainPoint.pointType}</small></td>
        </tr>`;
    });
    html += `</tbody></table></div></div>`;

    // ---- 五输穴五行 ----
    html += `<div class="detail-section">
        <h3>🖐 五输穴五行属性</h3>
        <div style="font-size:0.78em;padding:10px 14px;color:#888;">阴经：井木→荥火→输土→经金→合水 | 阳经：井金→荥水→输木→经火→合土</div>
        <div style="padding:0 14px 14px;">`;
    allHours.forEach(h => {
        const nz = h.nazi;
        if (!nz) return;
        html += `<div class="wushu-row">
            <div style="font-weight:700;color:#2c3e50;margin-bottom:4px;">${h.shiChenName} ${nz.meridian}</div>
            <div class="wushu-pills">
                <span>井<em class="wx-mini wx-${nz.well.wuXing}">${nz.well.wuXing}</em>${nz.well.name}</span>
                <span>荥<em class="wx-mini wx-${nz.spring.wuXing}">${nz.spring.wuXing}</em>${nz.spring.name}</span>
                <span>输<em class="wx-mini wx-${nz.stream.wuXing}">${nz.stream.wuXing}</em>${nz.stream.name}</span>
                <span>经<em class="wx-mini wx-${nz.river.wuXing}">${nz.river.wuXing}</em>${nz.river.name}</span>
                <span>合<em class="wx-mini wx-${nz.sea.wuXing}">${nz.sea.wuXing}</em>${nz.sea.name}</span>
            </div>
        </div>`;
    });
    html += `</div></div>`;

    // ---- 纳甲法合日互用说明 ----
    html += `<div class="detail-section">
        <h3>🔄 纳甲法 · 合日互用穴</h3>
        <div style="padding:14px;font-size:0.85em;">
            <p style="margin-bottom:8px;">${NAJIA_HUYONG_INFO[dayGZ.gan] || '天干合化原理'}</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px;">
                <span class="he-gan-item">甲⇌己(土)</span>
                <span class="he-gan-item">乙⇌庚(金)</span>
                <span class="he-gan-item">丙⇌辛(水)</span>
                <span class="he-gan-item">丁⇌壬(木)</span>
                <span class="he-gan-item">戊⇌癸(火)</span>
            </div>
            <p style="margin-top:8px;font-size:0.8em;color:#888;">徐凤《针灸大全》：阳日阳时、阴日阴时开穴；阳日阴时或阴日阳时主穴不开，可取天干五合之夫妻日对应时辰穴位（表中<span style="color:#e67e22;">橙色</span>标记为夫妻互用）</p>
        </div>
    </div>`;

    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('show');
    document.body.style.overflow = 'hidden';

    // 滚动到当前时辰
    requestAnimationFrame(() => {
        const curRow = document.querySelector('.hour-current');
        if (curRow) curRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('show');
    document.body.style.overflow = '';
}
