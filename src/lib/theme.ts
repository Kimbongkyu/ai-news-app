// 사용자가 고른 테마("dark" | "light")를 저장하는 localStorage 키
export const THEME_STORAGE_KEY = "theme";

// 첫 페인트 전에 <html>에 dark 클래스를 붙여 화면 깜빡임을 막는다.
// 저장된 선택이 없으면 OS 설정(prefers-color-scheme)을 따른다.
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
