/** 클립보드 API 실패 시 사용자 안내 (한국어) */
export const CLIPBOARD_COPY_FAILED_KO =
  "클립보드 복사에 실패했습니다. 주소를 직접 선택해 복사하세요.";

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
