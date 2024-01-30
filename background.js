const Base_Url = "https://aims.iiitr.ac.in/iiitraichur/";

chrome.webNavigation.onCompleted.addListener(
  (tab) => {
    console.log(tab);
    if (tab.url != Base_Url) return;

    chrome.tabs.executeScript(tab.tabId, {
      file: "src/Captcha/captcha.js",
    });
  },
  { url: [{ urlMatches: Base_Url }] }
);
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {},
      }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()],
    }]);
  });
});
