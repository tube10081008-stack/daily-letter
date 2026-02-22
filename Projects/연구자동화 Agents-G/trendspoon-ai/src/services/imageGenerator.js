/**
 * TrendSpoon AI — 이미지 생성 서비스
 * 카드뉴스 HTML 요소를 고해상도 PNG로 변환하고 ZIP 다운로드
 */
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * HTML 요소를 PNG 이미지로 변환
 */
export async function elementToPng(element) {
    const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        width: 1080,
        height: 1080,
        skipFonts: true,  // 크로스오리진 폰트 문제 우회
        cacheBust: true,
        filter: (node) => {
            if (node.classList && node.classList.contains('no-export')) return false;
            return true;
        }
    });

    return dataUrl;
}

/**
 * 모든 슬라이드를 ZIP 파일로 다운로드
 */
export async function downloadAllAsZip(slideCount, date, onProgress) {
    const zip = new JSZip();
    const folder = zip.folder(`trendspoon_${date}`);
    const slideNames = ['cover', 'news1_headline', 'news1_detail', 'news2_headline', 'news2_detail', 'news3_headline', 'news3_detail', 'outro'];

    for (let i = 0; i < slideCount; i++) {
        onProgress?.(`슬라이드 ${i + 1}/${slideCount} 변환 중...`, ((i + 1) / slideCount) * 100);

        const element = document.getElementById(`card-slide-${i}`);
        if (!element) {
            console.warn(`슬라이드 ${i} 요소를 찾을 수 없습니다.`);
            continue;
        }

        try {
            const dataUrl = await elementToPng(element);
            const base64Data = dataUrl.split(',')[1];
            const fileName = `${slideNames[i] || `slide_${i + 1}`}.png`;
            folder.file(fileName, base64Data, { base64: true });
        } catch (err) {
            console.error(`슬라이드 ${i} 변환 실패:`, err);
        }
    }

    onProgress?.('ZIP 파일 생성 중...', 95);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `trendspoon_${date}.zip`);
    onProgress?.('✅ 다운로드 완료!', 100);
}

/**
 * 단일 슬라이드 다운로드
 */
export async function downloadSingleSlide(slideIndex, slideName) {
    const element = document.getElementById(`card-slide-${slideIndex}`);
    if (!element) throw new Error('슬라이드를 찾을 수 없습니다.');

    const dataUrl = await elementToPng(element);

    const link = document.createElement('a');
    link.download = `trendspoon_${slideName}.png`;
    link.href = dataUrl;
    link.click();
}
