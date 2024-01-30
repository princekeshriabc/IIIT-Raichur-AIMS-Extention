function fillCaptcha() {
    const CAPTCHA = document
        .getElementById("appCaptchaLoginImg")
        .src.split("/");

    document.getElementById("captcha").value = CAPTCHA[CAPTCHA.length - 1];
}

fillCaptcha();

document.getElementById("loginCapchaRefresh").addEventListener("click", (e) => {
    setTimeout(fillCaptcha, 1000);
});