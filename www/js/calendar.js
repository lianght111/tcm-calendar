/**
 * calendar.js - 干支计算、节气计算、五运六气计算
 */

// =================== 缓存 ===================
const _solarTermCache = {};
const _dayGZCache = {};

// =================== 干支计算 ===================

/**
 * 计算年干支
 * 以立春为界，立春前属上一年
 */
function getYearGanZhi(date) {
    const year = date.getFullYear();
    const solarTerms = getSolarTermDates(year);
    const liChun = solarTerms[2]; // 立春索引

    let effectiveYear = year;
    if (date < liChun) {
        effectiveYear = year - 1;
    }

    const ganIdx = (effectiveYear - 4) % 10;
    const zhiIdx = (effectiveYear - 4) % 12;
    return {
        gan: TIAN_GAN[ganIdx < 0 ? ganIdx + 10 : ganIdx],
        zhi: DI_ZHI[zhiIdx < 0 ? zhiIdx + 12 : zhiIdx],
        ganzhi: TIAN_GAN[ganIdx < 0 ? ganIdx + 10 : ganIdx] + DI_ZHI[zhiIdx < 0 ? zhiIdx + 12 : zhiIdx],
        ganIdx: ganIdx < 0 ? ganIdx + 10 : ganIdx,
        zhiIdx: zhiIdx < 0 ? zhiIdx + 12 : zhiIdx,
        sexagenaryNum: getSexagenaryNum(ganIdx < 0 ? ganIdx + 10 : ganIdx, zhiIdx < 0 ? zhiIdx + 12 : zhiIdx)
    };
}

/**
 * 计算月干支
 * 以节气为月界：立春=寅月，惊蛰=卯月，清明=辰月...
 * 五虎遁：甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，若问戊癸何方发，甲寅之上好追求
 */
function getMonthGanZhi(date) {
    const year = date.getFullYear();
    const solarTerms = getSolarTermDates(year);
    const prevYearTerms = getSolarTermDates(year - 1);
    const liChunThisYear = solarTerms[2];
    const xiaoHanThisYear = solarTerms[0];

    // 节气月界定：
    // 小寒→丑月, 立春→寅月, 惊蛰→卯月, ..., 大雪→子月
    // 节索引 -> 月: 0→11(丑),2→0(寅),4→1(卯),6→2(辰),8→3(巳),
    //                   10→4(午),12→5(未),14→6(申),16→7(酉),
    //                   18→8(戌),20→9(亥),22→10(子)

    let lunarMonthIdx = 0;
    let effectiveYear = year;

    if (date >= liChunThisYear) {
        // 立春及之后 → 属于本年干支年
        effectiveYear = year;
        // 从索引22(大雪)开始倒查，找到最近的节
        const jieIndices = [22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2];
        const jieToMonth = { 22: 10, 20: 9, 18: 8, 16: 7, 14: 6, 12: 5, 10: 4, 8: 3, 6: 2, 4: 1, 2: 0 };
        for (const j of jieIndices) {
            if (date >= solarTerms[j]) {
                lunarMonthIdx = jieToMonth[j];
                break;
            }
        }
        // 默认立春 → 寅月(0)
    } else if (date >= xiaoHanThisYear) {
        // 小寒后、立春前 → 属于上年干支年的丑月
        effectiveYear = year - 1;
        lunarMonthIdx = 11;
    } else {
        // 小寒之前 → 属于上年干支年，需要查找到对应的月
        effectiveYear = year - 1;
        // 首先查看上一年12月的大雪
        const prevDaXue = prevYearTerms[22];
        if (date >= prevDaXue) {
            lunarMonthIdx = 10; // 子月
        } else {
            // 继续往前查（上一年12月前还有其他月）
            const jieIndices = [20, 18, 16, 14, 12, 10, 8, 6, 4, 2];
            const jieToMonth = { 20: 9, 18: 8, 16: 7, 14: 6, 12: 5, 10: 4, 8: 3, 6: 2, 4: 1, 2: 0 };
            let found = false;
            for (const j of jieIndices) {
                if (date >= prevYearTerms[j]) {
                    lunarMonthIdx = jieToMonth[j];
                    found = true;
                    break;
                }
            }
            if (!found) {
                // 在去年立春之前（极罕见，1月初），也属于子月
                lunarMonthIdx = 10;
            }
        }
    }

    // 五虎遁：根据年干计算月干起首
    const yearGanIdx = (effectiveYear - 4) % 10;
    const adjustedYearGanIdx = yearGanIdx < 0 ? yearGanIdx + 10 : yearGanIdx;

    // 五虎遁规则：(年干对应的寅月天干)
    // 甲己 → 丙寅, 乙庚 → 戊寅, 丙辛 → 庚寅, 丁壬 → 壬寅, 戊癸 → 甲寅
    const huDunStart = [2, 4, 6, 8, 0]; // 甲/己→2(丙), 乙/庚→4(戊), 丙/辛→6(庚), 丁/壬→8(壬), 戊/癸→0(甲)
    const groupIdx = Math.floor(adjustedYearGanIdx / 2); // 0=甲己, 1=乙庚, 2=丙辛, 3=丁壬, 4=戊癸
    const monthGanIdx = (huDunStart[groupIdx] + lunarMonthIdx) % 10;
    const monthZhiIdx = (lunarMonthIdx + 2) % 12; // 寅=2

    return {
        gan: TIAN_GAN[monthGanIdx],
        zhi: DI_ZHI[monthZhiIdx],
        ganzhi: TIAN_GAN[monthGanIdx] + DI_ZHI[monthZhiIdx],
        ganIdx: monthGanIdx,
        zhiIdx: monthZhiIdx,
        lunarMonth: lunarMonthIdx + 1
    };
}

/**
 * 计算日干支
 * 基准: 2000年1月1日 = 戊午日 (60甲子序号: 54)
 */
function getDayGanZhi(date) {
    const base = new Date(Date.UTC(2000, 0, 1)); // 2000-01-01 = 戊午日(54)
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const diffDays = Math.floor((utc - base) / 86400000);
    const cycleDay = (54 + ((diffDays % 60) + 60) % 60) % 60;
    const ganIdx = cycleDay % 10;
    const zhiIdx = cycleDay % 12;
    return {
        gan: TIAN_GAN[ganIdx],
        zhi: DI_ZHI[zhiIdx],
        ganzhi: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx],
        ganIdx: ganIdx,
        zhiIdx: zhiIdx,
        sexagenaryNum: cycleDay
    };
}

/**
 * 计算时干支
 * 五鼠遁：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
 */
function getHourGanZhi(date, hour) {
    const dayGZ = getDayGanZhi(date);
    const dayGanIdx = dayGZ.ganIdx;

    // 找到时辰
    let shiChenIdx = 0;
    if (hour >= 23 || hour < 1) shiChenIdx = 0;      // 子时
    else if (hour >= 1 && hour < 3) shiChenIdx = 1;   // 丑时
    else if (hour >= 3 && hour < 5) shiChenIdx = 2;   // 寅时
    else if (hour >= 5 && hour < 7) shiChenIdx = 3;   // 卯时
    else if (hour >= 7 && hour < 9) shiChenIdx = 4;   // 辰时
    else if (hour >= 9 && hour < 11) shiChenIdx = 5;  // 巳时
    else if (hour >= 11 && hour < 13) shiChenIdx = 6; // 午时
    else if (hour >= 13 && hour < 15) shiChenIdx = 7; // 未时
    else if (hour >= 15 && hour < 17) shiChenIdx = 8; // 申时
    else if (hour >= 17 && hour < 19) shiChenIdx = 9; // 酉时
    else if (hour >= 19 && hour < 21) shiChenIdx = 10; // 戌时
    else if (hour >= 21 && hour < 23) shiChenIdx = 11; // 亥时

    // 五鼠遁：日干对应的子时天干
    // 甲己→甲子, 乙庚→丙子, 丙辛→戊子, 丁壬→庚子, 戊癸→壬子
    // 天干五合分组：甲己idx%5=0，乙庚=1，丙辛=2，丁壬=3，戊癸=4
    const ratDunStart = [0, 2, 4, 6, 8]; // 甲己→甲，乙庚→丙，丙辛→戊，丁壬→庚，戊癸→壬
    const groupIdx = dayGanIdx % 5;
    const hourGanIdx = (ratDunStart[groupIdx] + shiChenIdx) % 10;

    return {
        gan: TIAN_GAN[hourGanIdx],
        zhi: DI_ZHI[shiChenIdx],
        ganzhi: TIAN_GAN[hourGanIdx] + DI_ZHI[shiChenIdx],
        ganIdx: hourGanIdx,
        zhiIdx: shiChenIdx,
        shiChen: SHI_CHEN[shiChenIdx]
    };
}

/**
 * 获取当前时辰的描述（一个时辰=两小时）
 */
function getCurrentShiChen(date) {
    const hour = date.getHours();
    const hgz = getHourGanZhi(date, hour);
    return hgz;
}

// =================== 节气计算 ===================

/**
 * 计算太阳黄经的近似值（度数）
 * 使用简化的太阳位置算法
 */
function getSunLongitude(jd) {
    // Julian centuries from J2000.0
    const T = (jd - 2451545.0) / 36525.0;
    const T2 = T * T;
    const T3 = T2 * T;

    // Mean longitude of the sun
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;

    // Mean anomaly of the sun
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
    const Mrad = M * Math.PI / 180.0;

    // Sun's equation of center
    const C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(Mrad)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
            + 0.000289 * Math.sin(3 * Mrad);

    // True longitude
    let L = L0 + C;

    // Normalize to [0, 360)
    L = ((L % 360) + 360) % 360;

    return L;
}

/**
 * 计算指定年份的二十四节气日期
 * 使用二分法迭代求解太阳黄经到达指定角度的时刻
 */
function getSolarTermDates(year) {
    if (_solarTermCache[year]) return _solarTermCache[year];

    const terms = [];

    for (let i = 0; i < 24; i++) {
        const targetAngle = SOLAR_TERMS[i].angle;
        const baseMonth = SOLAR_TERMS[i].month;

        // 初始估计：使用通用公式
        const Y = year % 100;
        let estimatedDay = Math.floor(Y * 0.2422 + SOLAR_TERM_C[i]) - Math.floor(Y / 4);

        if (baseMonth === 0 && i >= 22) {
            // 小寒大寒在次年1月
            const nextY = (year + 1) % 100;
            estimatedDay = Math.floor(nextY * 0.2422 + SOLAR_TERM_C[i]) - Math.floor(nextY / 4);
        }

        // 使用二分法精确求解
        const month0 = (baseMonth === 0 && i >= 22) ? 0 : baseMonth;
        const actualYear = (baseMonth === 0 && i >= 22) ? year + 1 : year;

        // 在估算日期前后搜索精确日期
        let bestDate = null;
        let minDiff = Infinity;

        for (let d = estimatedDay - 2; d <= estimatedDay + 2; d++) {
            if (d < 1 || d > 31) continue;

            // 在当天不同时间点尝试（中午12点作为基准）
            const testDate = new Date(actualYear, month0, d, 12, 0, 0);
            const jd = getJulianDay(testDate);
            const actualAngle = getSunLongitude(jd);

            // 计算太阳黄经与目标角度的差值
            let diff = actualAngle - targetAngle;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            if (Math.abs(diff) < Math.abs(minDiff)) {
                minDiff = diff;
                bestDate = new Date(actualYear, month0, d);
            }
        }

        // 如果需要更精确，进行日内的二分修正
        if (bestDate && Math.abs(minDiff) > 1.5) {
            // 调整日期
            const adjustDir = minDiff > 0 ? -1 : 1;
            const adjustedDate = new Date(bestDate);
            adjustedDate.setDate(adjustedDate.getDate() + adjustDir);

            const jd2 = getJulianDay(adjustedDate);
            const angle2 = getSunLongitude(jd2);
            let diff2 = angle2 - targetAngle;
            if (diff2 > 180) diff2 -= 360;
            if (diff2 < -180) diff2 += 360;

            if (Math.abs(diff2) < Math.abs(minDiff)) {
                bestDate = adjustedDate;
                minDiff = diff2;
            }
        }

        terms.push(bestDate || new Date(actualYear, month0, estimatedDay));
    }

    _solarTermCache[year] = terms;
    return terms;
}

/**
 * 获取某天所在的节气
 */
function getCurrentSolarTerm(date) {
    const year = date.getFullYear();
    const terms = getSolarTermDates(year);
    const termsNextYear = getSolarTermDates(year + 1);
    const termsPrevYear = getSolarTermDates(year - 1);

    // 合并三年节气数据确保覆盖所有日期
    const allTerms = [...termsPrevYear, ...terms, ...termsNextYear];

    // 找到 date 之前的最后一个节气
    let currentTerm = null;
    for (let i = allTerms.length - 1; i >= 0; i--) {
        if (date >= allTerms[i]) {
            currentTerm = { ...SOLAR_TERMS[i % 24], date: allTerms[i], index: i % 24 };
            break;
        }
    }

    // 找到下一个节气
    let nextTerm = null;
    for (let i = 0; i < allTerms.length; i++) {
        if (date < allTerms[i]) {
            nextTerm = { ...SOLAR_TERMS[i % 24], date: allTerms[i], index: i % 24 };
            break;
        }
    }

    return { current: currentTerm, next: nextTerm };
}

/**
 * 获取指定日期的节气（如果当天是节气）
 */
function getSolarTermOnDate(date) {
    const year = date.getFullYear();
    const terms = getSolarTermDates(year);
    const termsNextYear = getSolarTermDates(year + 1);

    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    for (let i = 0; i < terms.length; i++) {
        const termDate = new Date(terms[i].getFullYear(), terms[i].getMonth(), terms[i].getDate());
        if (checkDate.getTime() === termDate.getTime()) {
            return { ...SOLAR_TERMS[i], date: terms[i] };
        }
    }

    // 检查下一年一月的节气
    for (let i = 0; i < 2; i++) {
        const termDate = new Date(termsNextYear[i].getFullYear(), termsNextYear[i].getMonth(), termsNextYear[i].getDate());
        if (checkDate.getTime() === termDate.getTime()) {
            return { ...SOLAR_TERMS[i], date: termsNextYear[i] };
        }
    }

    return null;
}

/**
 * 计算儒略日
 */
function getJulianDay(date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    const d = date.getDate() + date.getHours() / 24.0 + date.getMinutes() / 1440.0;

    if (m <= 2) {
        y -= 1;
        m += 12;
    }

    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);

    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

// =================== 五运六气计算 ===================

/**
 * 岁运（中运）:
 * 甲己→土运，乙庚→金运，丙辛→水运，丁壬→木运，戊癸→火运
 * 阳干→太过，阴干→不及
 */
function getYearMovement(yearGanZhi) {
    const ganIdx = yearGanZhi.ganIdx;
    // 天干五行对应：甲乙木(0,1), 丙丁火(2,3), 戊己土(4,5), 庚辛金(6,7), 壬癸水(8,9)
    const wuXingMap = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
    const wxIdx = wuXingMap[ganIdx];
    const isYang = GAN_YIN_YANG[ganIdx] === 1;

    return {
        name: yearGanZhi.gan + '年',
        wuXing: WU_XING_NAMES[wxIdx],
        wuXingIdx: wxIdx,
        excess: isYang ? '太过' : '不及',
        description: `${yearGanZhi.gan}为${isYang ? '阳' : '阴'}干，${WU_XING_NAMES[wxIdx]}运${isYang ? '太过' : '不及'}`
    };
}

/**
 * 主运（木火土金水，每年固定顺序）
 * 各运主73日5刻
 */
function getHostMovement() {
    return [
        { name: '初运', wuXing: '木', wuXingIdx: 0, period: '大寒至春分后13日' },
        { name: '二运', wuXing: '火', wuXingIdx: 1, period: '春分后13日至芒种后10日' },
        { name: '三运', wuXing: '土', wuXingIdx: 2, period: '芒种后10日至处暑后7日' },
        { name: '四运', wuXing: '金', wuXingIdx: 3, period: '处暑后7日至立冬后4日' },
        { name: '五运', wuXing: '水', wuXingIdx: 4, period: '立冬后4日至大寒' }
    ];
}

/**
 * 客运：以岁运为初运，按五行相生顺序排列
 */
function getGuestMovement(yearMovement) {
    const order = [0, 1, 2, 3, 4]; // 木火土金水顺序
    const startIdx = yearMovement.wuXingIdx;
    const names = ['初运', '二运', '三运', '四运', '五运'];

    const result = [];
    for (let i = 0; i < 5; i++) {
        const wxIdx = (startIdx + i) % 5;
        const isYang = ((i + startIdx + (yearMovement.excess === '太过' ? 1 : 0)) % 2 === 0);
        result.push({
            name: names[i],
            wuXing: WU_XING_NAMES[wxIdx],
            wuXingIdx: wxIdx,
            excess: isYang ? '太过' : '不及'
        });
    }
    return result;
}

/**
 * 主气（六气）：厥阴风木、少阴君火、少阳相火、太阴湿土、阳明燥金、太阳寒水
 * 每气60日87.5刻
 */
function getHostQi() {
    return [
        { name: '初之气', qi: '厥阴风木', wuXing: '木', wuXingIdx: 0, period: '大寒至春分' },
        { name: '二之气', qi: '少阴君火', wuXing: '火', wuXingIdx: 1, period: '春分至小满' },
        { name: '三之气', qi: '少阳相火', wuXing: '火', wuXingIdx: 1, period: '小满至大暑' },
        { name: '四之气', qi: '太阴湿土', wuXing: '土', wuXingIdx: 2, period: '大暑至秋分' },
        { name: '五之气', qi: '阳明燥金', wuXing: '金', wuXingIdx: 3, period: '秋分至小雪' },
        { name: '终之气', qi: '太阳寒水', wuXing: '水', wuXingIdx: 4, period: '小雪至大寒' }
    ];
}

/**
 * 客气：根据年支推算司天在泉
 * 子午→少阴君火司天/阳明燥金在泉
 * 丑未→太阴湿土/太阳寒水
 * 寅申→少阳相火/厥阴风木
 * 卯酉→阳明燥金/少阴君火
 * 辰戌→太阳寒水/太阴湿土
 * 巳亥→厥阴风木/少阳相火
 */
function getGuestQi(yearGanZhi) {
    const zhiIdx = yearGanZhi.zhiIdx;
    const siTianMap = [
        { siTian: '少阴君火', zaiQuan: '阳明燥金' }, // 子午
        { siTian: '太阴湿土', zaiQuan: '太阳寒水' }, // 丑未
        { siTian: '少阳相火', zaiQuan: '厥阴风木' }, // 寅申
        { siTian: '阳明燥金', zaiQuan: '少阴君火' }, // 卯酉
        { siTian: '太阳寒水', zaiQuan: '太阴湿土' }, // 辰戌
        { siTian: '厥阴风木', zaiQuan: '少阳相火' }, // 巳亥
    ];

    const pairIdx = Math.floor(zhiIdx / 2);
    const base = siTianMap[pairIdx];

    // 六气顺序（按三阴三阳排列）
    const qiOrder = [
        '厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水'
    ];

    const siTianOrder = qiOrder.indexOf(base.siTian);

    const guestQiList = [];
    const stepNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];

    // 客气：以司天为三之气，按三阴三阳顺序排列
    for (let i = 0; i < 6; i++) {
        const offset = (i - 2); // 相对于司天（三之气的位置）
        const qiIdx = ((siTianOrder + offset) % 6 + 6) % 6;
        guestQiList.push({
            name: stepNames[i],
            qi: qiOrder[qiIdx],
            isSiTian: i === 2,
            isZaiQuan: i === 5
        });
    }

    return {
        siTian: base.siTian,
        zaiQuan: base.zaiQuan,
        steps: guestQiList
    };
}

/**
 * 获取当前日期的五运六气详情
 */
function getWuYunLiuQiForDate(date) {
    const year = date.getFullYear();
    const yearGZ = getYearGanZhi(date);
    const yearMovement = getYearMovement(yearGZ);
    const hostMovements = getHostMovement();
    const guestMovements = getGuestMovement(yearMovement);
    const hostQi = getHostQi();
    const guestQi = getGuestQi(yearGZ);

    // 使用实际节气日期来确定运和气
    const currTerms = getSolarTermDates(year);
    const prevTerms = getSolarTermDates(year - 1);

    // 运气周期从大寒开始
    // 运：初运(大寒→春分后13日), 二运(~4/3→~6/15), 三运(~6/15→~8/27), 四运(~8/27→~11/7), 五运(~11/7→大寒)
    // 气：初气(大寒→春分), 二气(春分→小满), 三气(小满→大暑), 四气(大暑→秋分), 五气(秋分→小雪), 终气(小雪→大寒)
    
    const daHan = currTerms[1];       // 大寒
    const chunFen = currTerms[5];     // 春分
    const xiaoMan = currTerms[9];     // 小满
    const daShu = currTerms[13];      // 大暑
    const qiuFen = currTerms[17];     // 秋分
    const xiaoXue = currTerms[21];    // 小雪
    const nextDaHan = getSolarTermDates(year + 1)[1]; // 下一年大寒

    // 运边界：初运~二运(~春分+13天)，大致用惊蛰(春分前1节气)到春分中点近似
    const jingZhe = currTerms[3];     // 惊蛰 ~3/6
    const mangZhong = currTerms[10];  // 芒种 ~6/6
    const chuShu = currTerms[15];     // 处暑 ~8/23
    const liDong = currTerms[19];     // 立冬 ~11/7

    let currentHostMove = hostMovements[0];
    let currentGuestMove = guestMovements[0];
    let currentHostQ = hostQi[0];
    let currentGuestQ = guestQi.steps[0];

    // 判断运
    if (date >= daHan && date < chunFen) {
        // 初运（简化：大寒到春分附近）
        currentHostMove = hostMovements[0];
        currentGuestMove = guestMovements[0];
    } else if (date >= chunFen && date < mangZhong) {
        currentHostMove = hostMovements[1];
        currentGuestMove = guestMovements[1];
    } else if (date >= mangZhong && date < chuShu) {
        currentHostMove = hostMovements[2];
        currentGuestMove = guestMovements[2];
    } else if (date >= chuShu && date < liDong) {
        currentHostMove = hostMovements[3];
        currentGuestMove = guestMovements[3];
    } else {
        currentHostMove = hostMovements[4];
        currentGuestMove = guestMovements[4];
    }

    // 判断气
    if (date >= daHan && date < chunFen) {
        currentHostQ = hostQi[0];
        currentGuestQ = guestQi.steps[0];
    } else if (date >= chunFen && date < xiaoMan) {
        currentHostQ = hostQi[1];
        currentGuestQ = guestQi.steps[1];
    } else if (date >= xiaoMan && date < daShu) {
        currentHostQ = hostQi[2];
        currentGuestQ = guestQi.steps[2];
    } else if (date >= daShu && date < qiuFen) {
        currentHostQ = hostQi[3];
        currentGuestQ = guestQi.steps[3];
    } else if (date >= qiuFen && date < xiaoXue) {
        currentHostQ = hostQi[4];
        currentGuestQ = guestQi.steps[4];
    } else {
        currentHostQ = hostQi[5];
        currentGuestQ = guestQi.steps[5];
    }

    return {
        yearMovement,
        hostMovements,
        guestMovements,
        hostQi,
        guestQi,
        currentHostMove,
        currentGuestMove,
        currentHostQ,
        currentGuestQ
    };
}

/**
 * 获取天干对应的五行属性
 */
function getGanWuXing(ganIdx) {
    return {
        wuXing: WU_XING_NAMES[GAN_WU_XING[ganIdx]],
        wuXingIdx: GAN_WU_XING[ganIdx],
        yinYang: getGanYinYang(ganIdx)
    };
}

function getZhiWuXing(zhiIdx) {
    return {
        wuXing: WU_XING_NAMES[ZHI_WU_XING[zhiIdx]],
        wuXingIdx: ZHI_WU_XING[zhiIdx],
        yinYang: getZhiYinYang(zhiIdx)
    };
}

/**
 * 计算天干地支对应的六十甲子序号 (0-59)
 * 公式: (gan * 6 - zhi * 5 + 60) % 60
 */
function getSexagenaryNum(ganIdx, zhiIdx) {
    return ((ganIdx * 6 - zhiIdx * 5) % 60 + 60) % 60;
}

// =================== 农历（万年历） ===================
// 农历数据 1900-2050，编码方式：
// 低4位：闰月月份（0=无闰月）
// 高12位：12个月的大小月（1=30天, 0=29天），正月在最高位
// 接下来4位（bits 16-19）：闰月天数（1=30天, 0=29天）
const LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63
];

const LUNAR_MONTH_NAMES = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
const LUNAR_DAY_NAMES = [
    '', '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
];

// 农历年的总天数
function lunarYearDays(y) {
    let sum = 348; // 12 * 29
    for (let i = 0x8000; i > 0x8; i >>= 1) {
        sum += (LUNAR_INFO[y] & i) ? 1 : 0;
    }
    return sum + leapMonthDays(y);
}

// 农历闰月的天数
function leapMonthDays(y) {
    if (leapMonth(y)) {
        return (LUNAR_INFO[y] & 0x10000) ? 30 : 29;
    }
    return 0;
}

// 农历闰月月份（0=无闰月）
function leapMonth(y) {
    return LUNAR_INFO[y] & 0xf;
}

// 农历指定月的天数
function lunarMonthDays(y, m) {
    return (LUNAR_INFO[y] & (0x10000 >> m)) ? 30 : 29;
}

/**
 * 公历转农历
 * 返回: { year, month, day, isLeap, monthName, dayName, yearGanZhi, yearAnimal }
 */
function getLunarDate(date) {
    const baseYear = 1900;
    const baseDate = new Date(1900, 0, 31); // 1900-01-31 = 正月初一
    
    let offset = Math.floor((date - baseDate) / 86400000);
    
    let year = 0;
    let daysInYear;
    
    // 找到农历年份
    for (year = baseYear; year < 2101 && offset > 0; year++) {
        daysInYear = lunarYearDays(year - baseYear);
        offset -= daysInYear;
    }
    if (offset < 0) {
        offset += daysInYear;
        year--;
    }
    
    const lunarY = year;
    const yearIdx = year - baseYear;
    
    // 获取闰月
    const leap = leapMonth(yearIdx);
    let isLeap = false;
    
    // 找到月份和日期
    let month = 0;
    for (month = 1; month <= 12 && offset > 0; month++) {
        // 闰月
        if (leap > 0 && month === (leap + 1) && !isLeap) {
            month--;
            isLeap = true;
            const leapDays = leapMonthDays(yearIdx);
            if (offset >= leapDays) {
                offset -= leapDays;
                isLeap = false;
                month++;
            }
        } else {
            const mDays = lunarMonthDays(yearIdx, month);
            if (offset >= mDays) {
                offset -= mDays;
            } else {
                break;
            }
        }
    }
    
    // offset 现在是从月初算起的天数（0-based），加1得到日
    const day = Math.floor(offset) + 1;
    
    if (month > 12) month = 12;
    if (day < 1) day = 1;
    
    // 农历年干支
    const yearGZ = getYearGanZhi(date);
    const animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
    const animal = animals[yearGZ.zhiIdx];
    
    // 月日名称
    let monthName = LUNAR_MONTH_NAMES[month - 1] || '';
    if (isLeap) monthName = '闰' + monthName;
    let dayName = LUNAR_DAY_NAMES[day] || '';
    
    return {
        year: lunarY,
        month: month,
        day: day,
        isLeap: isLeap,
        monthName: monthName,
        dayName: dayName,
        yearGanZhi: yearGZ.ganzhi,
        yearAnimal: animal
    };
}
